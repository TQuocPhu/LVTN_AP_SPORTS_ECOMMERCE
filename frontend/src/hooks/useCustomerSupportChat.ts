'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/hooks/useAuth';
import { supportChatController } from '@/controllers/support-chat-controller';
import { SupportConversation, SupportMessage } from '@/types/support-chat';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const BASE_WS_URL = BASE_URL.replace('/api/v1', '/ws');

export function useCustomerSupportChat() {
  const { user, loading: authLoading } = useAuth();

  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Input text & Modal xem ảnh
  const [inputText, setInputText] = useState('');
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  // Đánh giá sau khi kết thúc ca
  const [ratingStars, setRatingStars] = useState(5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // File ảnh đính kèm trước khi gửi
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Lịch sử các ca trò chuyện trước đó của khách
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [historyList, setHistoryList] = useState<SupportConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryConv, setSelectedHistoryConv] = useState<SupportConversation | null>(null);
  const [historyMessages, setHistoryMessages] = useState<SupportMessage[]>([]);

  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const userId = user?.id;

  // Tải phiên hỗ trợ đang hoạt động (không tự động tạo mới ca rác khi chưa gửi tin nhắn)
  const loadActiveConversation = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await supportChatController.getActiveConversation();
      if (res.data) {
        setConversation(res.data);
        const msgRes = await supportChatController.getMessages(res.data.id);
        if (msgRes.data) {
          setMessages(msgRes.data);
        }
      } else {
        setConversation(null);
        setMessages([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải phiên hỗ trợ.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Kết nối WebSocket STOMP
  useEffect(() => {
    if (!userId) {
      if (clientRef.current) {
        clientRef.current.deactivate().catch(() => {});
        clientRef.current = null;
      }
      setConversation(null);
      setMessages([]);
      return;
    }

    loadActiveConversation();

    let isSubscribed = true;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(BASE_WS_URL),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
      onConnect: () => {
        if (!isSubscribed) return;
        stompClient.subscribe('/user/queue/support-chat', (frame: IMessage) => {
          if (!frame.body || !isSubscribed) return;
          try {
            const newMsg: SupportMessage = JSON.parse(frame.body);
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Đồng bộ trạng thái conversation realtime nếu message có mang conversationStatus
            if (newMsg.conversationStatus) {
              setConversation((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  status: newMsg.conversationStatus as any,
                };
              });
            }

            if (newMsg.conversationId && newMsg.senderRole === 'STAFF') {
              supportChatController.markAsRead(newMsg.conversationId);
            }
          } catch (e) {
            console.error('Lỗi parse tin nhắn support WebSocket:', e);
          }
        });
      },
      onStompError: (frame) => {
        const errMsg = frame.headers['message'] || '';
        if (errMsg.includes('Session closed')) return;
        console.warn('[CustomerSupport STOMP] Thông báo broker:', errMsg);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      isSubscribed = false;
      stompClient.deactivate().catch(() => {});
      clientRef.current = null;
    };
  }, [userId, loadActiveConversation]);

  // Chọn ảnh để chuẩn bị gửi
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn định dạng ảnh hợp lệ (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Dung lượng ảnh tối đa là 5MB.');
      return;
    }

    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
  };

  // Gửi tin nhắn (Form Submit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = inputText.trim();
    if (!trimmed && !selectedImageFile) return;

    setIsSending(true);
    let attachmentUrl: string | undefined = undefined;

    try {
      // Nếu chưa có phiên nào, lúc khách bấm GỬI tin nhắn đầu tiên mới tạo ca mới
      let currentConv = conversation;
      if (!currentConv) {
        const createRes = await supportChatController.getOrCreateConversation({
          subject: trimmed || 'Khách hàng liên hệ tư vấn',
        });
        if (createRes.data) {
          currentConv = createRes.data;
          setConversation(createRes.data);
        } else {
          throw new Error('Không thể khởi tạo phiên trò chuyện.');
        }
      }

      if (selectedImageFile) {
        setIsUploadingImage(true);
        const uploadResult = await supportChatController.uploadMessageImage(selectedImageFile);
        attachmentUrl = uploadResult.url;
        setIsUploadingImage(false);
      }

      const res = await supportChatController.sendMessage(currentConv.id, {
        content: trimmed || undefined,
        attachmentUrl,
      });

      if (res.data) {
        const savedMsg = res.data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === savedMsg.id)) return prev;
          return [...prev, savedMsg];
        });
        setInputText('');
        clearSelectedImage();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi tin nhắn.');
    } finally {
      setIsSending(false);
      setIsUploadingImage(false);
    }
  };

  // Đánh giá ca hỗ trợ sau khi hoàn tất
  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation) return;
    setIsSubmittingRating(true);
    setErrorMessage(null);
    try {
      const res = await supportChatController.rateConversation(conversation.id, {
        rating: ratingStars,
        feedbackNote,
      });
      if (res.data) {
        setConversation(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi đánh giá.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Khởi tạo phiên trò chuyện mới (sau khi ca cũ đã hoàn tất/đóng)
  const startNewConversation = () => {
    setConversation(null);
    setMessages([]);
    setInputText('');
    clearSelectedImage();
    setFeedbackNote('');
    setRatingStars(5);
    setErrorMessage(null);
    setIsViewingHistory(false);
    setSelectedHistoryConv(null);
  };

  // Mở danh sách lịch sử ca hỗ trợ của khách hàng
  const openHistory = async () => {
    setIsViewingHistory(true);
    setSelectedHistoryConv(null);
    setIsLoadingHistory(true);
    setErrorMessage(null);
    try {
      const res = await supportChatController.getMyConversations(0, 20);
      if (res.data?.content) {
        setHistoryList(res.data.content);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải lịch sử hỗ trợ.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Xem chi tiết một ca trong lịch sử
  const viewHistoryItem = async (conv: SupportConversation) => {
    setSelectedHistoryConv(conv);
    setIsLoadingHistory(true);
    setErrorMessage(null);
    try {
      const res = await supportChatController.getMessages(conv.id);
      if (res.data) {
        setHistoryMessages(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải chi tiết cuộc trò chuyện.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Đóng lịch sử và quay lại ca hiện tại
  const closeHistory = () => {
    setIsViewingHistory(false);
    setSelectedHistoryConv(null);
    setHistoryMessages([]);
  };

  return {
    user,
    isAuthenticated: !!user,
    authLoading,
    conversation,
    messages,
    isLoading,
    isSending,
    isUploadingImage,
    errorMessage,
    clearError: () => setErrorMessage(null),
    inputText,
    setInputText,
    ratingStars,
    setRatingStars,
    feedbackNote,
    setFeedbackNote,
    isSubmittingRating,
    previewModalImg,
    setPreviewModalImg,
    selectedImagePreview,
    messagesEndRef,
    handleSelectImage,
    clearSelectedImage,
    handleFormSubmit,
    handleRatingSubmit,
    startNewConversation,
    refreshConversation: loadActiveConversation,
    // Lịch sử hỗ trợ của khách
    isViewingHistory,
    historyList,
    isLoadingHistory,
    selectedHistoryConv,
    historyMessages,
    openHistory,
    viewHistoryItem,
    closeHistory,
  };
}
