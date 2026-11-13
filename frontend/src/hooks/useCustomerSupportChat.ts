'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/hooks/useAuth';
import { supportChatController } from '@/controllers/support-chat-controller';
import { orderController } from '@/controllers/order-controller';
import { SupportConversation, SupportMessage } from '@/types/support-chat';
import { OrderResponse } from '@/types/order';

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

  // Chọn đơn hàng của khách để đính kèm trước khi bấm Gửi
  const [myOrders, setMyOrders] = useState<OrderResponse[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isOrderPickerOpen, setIsOrderPickerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  // Lịch sử các ca trò chuyện trước đó của khách
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [historyList, setHistoryList] = useState<SupportConversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [selectedHistoryConv, setSelectedHistoryConv] = useState<SupportConversation | null>(null);
  const [historyMessages, setHistoryMessages] = useState<SupportMessage[]>([]);

  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isCtrlPressedRef = useRef<boolean>(false);
  const lastCtrlTimeRef = useRef<number>(0);

  // Tự động điều chỉnh chiều cao ô nhập: mặc định giữ gọn 1 dòng (36px), chỉ giãn khi xuống dòng (Ctrl+Enter)
  const syncTextareaHeight = useCallback((textVal: string) => {
    const el = inputTextareaRef.current;
    if (!el) return;
    if (!textVal || !textVal.includes('\n')) {
      el.style.height = '36px';
      return;
    }
    el.style.height = '36px';
    el.style.height = `${Math.min(el.scrollHeight, 104)}px`;
  }, []);

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

            // Đồng bộ trạng thái conversation & mã đơn hàng realtime nếu message có mang thông tin cập nhật
            if (newMsg.conversationStatus || newMsg.orderId || newMsg.orderCode) {
              setConversation((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  status: (newMsg.conversationStatus as any) || prev.status,
                  orderId: newMsg.orderId ?? prev.orderId,
                  orderCode: newMsg.orderCode ?? prev.orderCode,
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

  // Mở/đóng danh sách đơn hàng của chính khách hàng để chọn đính kèm
  const toggleOrderPicker = async () => {
    const nextState = !isOrderPickerOpen;
    setIsOrderPickerOpen(nextState);
    if (nextState && myOrders.length === 0 && userId) {
      setIsLoadingOrders(true);
      try {
        const res = await orderController.getMyOrders(0, 20);
        if (res.data?.content) {
          setMyOrders(res.data.content);
        }
      } catch (err) {
        console.warn('Không thể tải danh sách đơn hàng của khách:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
  };

  const closeOrderPicker = () => {
    setIsOrderPickerOpen(false);
  };

  // Khi khách chọn 1 đơn hàng từ danh sách -> gắn vào thanh Preview (chưa tự động gửi ngay)
  const handleSelectOrder = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsOrderPickerOpen(false);
  };

  const clearSelectedOrder = () => {
    setSelectedOrder(null);
  };

  // Xử lý thay đổi nội dung ô nhập
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  // Theo dõi trạng thái phím Ctrl (kể cả khi bộ gõ tiếng Việt Unikey/EVKey nhả tạm VK_CONTROL trong vài ms)
  const handleInputKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Control' || e.key === 'Meta') {
      isCtrlPressedRef.current = false;
      lastCtrlTimeRef.current = Date.now();
    }
  };

  // Xử lý phím bấm: Ctrl+Enter (hoặc Cmd+Enter) mới xuống dòng, Enter thường là gửi tin nhắn
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Control' || e.key === 'Meta' || e.ctrlKey || e.metaKey) {
      isCtrlPressedRef.current = true;
      lastCtrlTimeRef.current = Date.now();
    }

    const isEnterKey =
      e.key === 'Enter' ||
      e.key === '\n' ||
      e.code === 'Enter' ||
      e.code === 'NumpadEnter' ||
      e.keyCode === 13 ||
      e.keyCode === 10;

    if (!isEnterKey) return;

    const isCtrlActive =
      e.ctrlKey ||
      e.metaKey ||
      e.nativeEvent.ctrlKey ||
      e.nativeEvent.metaKey ||
      e.getModifierState?.('Control') ||
      isCtrlPressedRef.current ||
      Date.now() - lastCtrlTimeRef.current < 180;

    // Nhấn Ctrl + Enter -> Chèn xuống dòng (\n) ngay tại con trỏ và mở rộng dòng
    if (isCtrlActive) {
      e.preventDefault();
      e.stopPropagation();
      const el = e.currentTarget;
      const currentVal = el.value;
      const start = el.selectionStart ?? currentVal.length;
      const end = el.selectionEnd ?? currentVal.length;
      const nextVal = `${currentVal.slice(0, start)}\n${currentVal.slice(end)}`;

      // Cập nhật đồng bộ DOM value + vị trí con trỏ ngay lập tức để không bị nhảy hoặc trễ nhịp render
      el.value = nextVal;
      el.setSelectionRange(start + 1, start + 1);
      setInputText(nextVal);

      requestAnimationFrame(() => {
        if (inputTextareaRef.current) {
          inputTextareaRef.current.setSelectionRange(start + 1, start + 1);
          inputTextareaRef.current.scrollTop = inputTextareaRef.current.scrollHeight;
        }
      });
      return;
    }

    // Nếu đang gõ dở dấu tiếng Việt (IME composing) thì không tự động gửi
    if (e.nativeEvent.isComposing) return;

    // Nhấn Enter đơn thuần -> Gửi tin nhắn (không xuống dòng)
    e.preventDefault();
    e.stopPropagation();
    if (inputText.trim() || selectedImageFile || selectedOrder) {
      handleFormSubmit();
    }
  };

  // Gửi tin nhắn
  const handleFormSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMessage(null);

    const trimmed = inputText.trim();
    if (!trimmed && !selectedImageFile && !selectedOrder) return;

    setIsSending(true);
    let attachmentUrl: string | undefined = undefined;

    try {
      // Nếu chưa có phiên nào hoặc phiên cũ đã kết thúc (RESOLVED/CLOSED), tạo ca mới
      let currentConv = conversation;
      if (!currentConv || currentConv.status === 'RESOLVED' || currentConv.status === 'CLOSED') {
        const defaultSubject = selectedOrder
          ? `Hỗ trợ đơn hàng #${selectedOrder.orderCode}`
          : 'Khách hàng liên hệ tư vấn';
        const createRes = await supportChatController.getOrCreateConversation({
          subject: trimmed || defaultSubject,
          orderId: selectedOrder?.id,
        });
        if (createRes.data) {
          currentConv = createRes.data;
          setConversation(createRes.data);
          // Nếu tạo phiên mới hoàn toàn, làm sạch danh sách tin nhắn cũ
          if (!conversation || createRes.data.id !== conversation.id) {
            setMessages([]);
          }
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
        orderId: selectedOrder?.id,
      });

      if (res.data) {
        const savedMsg = res.data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === savedMsg.id)) return prev;
          return [...prev, savedMsg];
        });
        if (savedMsg.orderId || savedMsg.orderCode) {
          setConversation((prev) =>
            prev
              ? {
                  ...prev,
                  orderId: savedMsg.orderId ?? prev.orderId,
                  orderCode: savedMsg.orderCode ?? prev.orderCode,
                }
              : prev
          );
        }
        setInputText('');
        syncTextareaHeight('');
        clearSelectedImage();
        clearSelectedOrder();
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

  // Khởi tạo phiên trò chuyện mới (sau khi ca cũ đã hoàn tất/đóng hoặc bấm Bỏ qua)
  const startNewConversation = async () => {
    // Nếu ca hiện tại đang ở trạng thái RESOLVED (chờ đánh giá), báo Backend đóng ca sang CLOSED
    if (conversation && conversation.status === 'RESOLVED') {
      try {
        await supportChatController.closeConversation(conversation.id);
      } catch (err) {
        console.warn('Lỗi khi tự động đóng ca hỗ trợ cũ:', err);
      }
    }
    setConversation(null);
    setMessages([]);
    setInputText('');
    syncTextareaHeight('');
    clearSelectedImage();
    clearSelectedOrder();
    setIsOrderPickerOpen(false);
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
    inputTextareaRef,
    handleInputChange,
    handleInputKeyDown,
    handleInputKeyUp,
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
    // Chọn đơn hàng của khách để đính kèm
    myOrders,
    isLoadingOrders,
    isOrderPickerOpen,
    selectedOrder,
    toggleOrderPicker,
    closeOrderPicker,
    handleSelectOrder,
    clearSelectedOrder,
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
