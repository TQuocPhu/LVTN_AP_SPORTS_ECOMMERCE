'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supportChatController } from '@/controllers/support-chat-controller';
import { adminSupportReportController } from '@/controllers/admin-support-report-controller';
import { userController } from '@/controllers/user-controller';
import {
  SupportConversation,
  SupportMessage,
  CreateSupportReportRequest,
} from '@/types/support-chat';

import { adminAiController } from '@/controllers/admin-ai-controller';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const BASE_WS_URL = BASE_URL.replace('/api/v1', '/ws');

/**
 * Phát âm thanh chuông hai âm tươi sáng qua Web Audio API (D5 -> A5)
 */
function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Nốt D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.09); // Nốt A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  } catch {
    // Bỏ qua nếu browser chặn audio autoplay
  }
}


export function useStaffSupportChat() {
  const { user } = useAdminAuth();

  // Tab hàng đợi (Active vs Queue vs History)
  const [queueTab, setQueueTab] = useState<'active' | 'queue' | 'history'>('active');

  const [waitingQueue, setWaitingQueue] = useState<SupportConversation[]>([]);
  const [myConversations, setMyConversations] = useState<SupportConversation[]>([]);
  const [historyConversations, setHistoryConversations] = useState<SupportConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);

  // Input & Modal Zoom ảnh chat
  const [chatInputText, setChatInputText] = useState('');
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState<string | null>(null);

  // AI Smart Reply states (Agent 5)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);

  // Loading & Error states
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal Báo Cáo Vi Phạm (Report Modal State & Logic)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [reportPreviews, setReportPreviews] = useState<string[]>([]);
  // Lưu danh sách ID các tin nhắn đã gửi báo cáo nhanh để khóa nút chống bấm lặp
  const [reportedMessageIds, setReportedMessageIds] = useState<Set<number>>(new Set());
  const [reportingMessageId, setReportingMessageId] = useState<number | null>(null);

  // Modal Thẩm Tra & Phê Duyệt Báo Cáo Vi Phạm Dành Riêng Cho ADMIN
  const [isAdminReviewModalOpen, setIsAdminReviewModalOpen] = useState(false);
  const [isProcessingReport, setIsProcessingReport] = useState(false);
  const [adminReviewNote, setAdminReviewNote] = useState('');
  const [isBanCustomerChecked, setIsBanCustomerChecked] = useState(true);

  // Modal Khóa Tài Khoản Trực Tiếp Dành Riêng Cho ADMIN (Không qua quy trình báo cáo của nhân viên)
  const [isDirectBanModalOpen, setIsDirectBanModalOpen] = useState(false);
  const [directBanReason, setDirectBanReason] = useState('');
  const [isDirectBanning, setIsDirectBanning] = useState(false);

  // Modal Hoàn Tất Ca (Resolve Modal State & Logic)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Preview ảnh đính kèm trước khi gửi trong chat
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // Trạng thái xem nội dung gốc của tin nhắn vi phạm
  const [revealedMessageIds, setRevealedMessageIds] = useState<Record<number, boolean>>({});

  const clientRef = useRef<Client | null>(null);
  const activeConversationRef = useRef<SupportConversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const userId = user?.id;

  // Tải danh sách hàng đợi và ca đang phụ trách
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    setIsLoadingQueue(true);
    setErrorMessage(null);
    try {
      const [queueRes, myRes] = await Promise.all([
        supportChatController.getWaitingQueue(),
        supportChatController.getMyActiveConversations(),
      ]);

      if (queueRes.data) {
        setWaitingQueue(queueRes.data);
      }
      if (myRes.data) {
        setMyConversations(myRes.data);
      }
      // Đồng bộ lại trạng thái của ca đang mở nếu backend đã cập nhật
      if (activeConversationRef.current) {
        const found = myRes.data?.find((c) => c.id === activeConversationRef.current?.id);
        if (found) {
          setActiveConversation(found);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi tải danh sách ca hỗ trợ.');
    } finally {
      setIsLoadingQueue(false);
    }
  }, [userId]);

  // Tải danh sách các ca lịch sử đã hoàn tất / đóng
  const loadHistoryConversations = useCallback(async () => {
    if (!userId) return;
    setIsLoadingHistory(true);
    try {
      const res = await supportChatController.getStaffHistory(0, 30);
      if (res.data?.content) {
        setHistoryConversations(res.data.content);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải lịch sử ca hỗ trợ:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [userId]);

  // Tải tin nhắn của ca đang chọn
  const loadMessages = useCallback(async (conversationId: number) => {
    setIsLoadingMessages(true);
    setErrorMessage(null);
    try {
      const res = await supportChatController.getStaffMessages(conversationId);
      if (res.data) {
        setMessages(res.data);
      }
      await supportChatController.markStaffAsRead(conversationId);
      setMyConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tải tin nhắn.');
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Chọn ca để trò chuyện
  const selectConversation = (conv: SupportConversation) => {
    setActiveConversation(conv);
    loadMessages(conv.id);
  };

  // Tiếp nhận ca (Atomic)
  const acceptConversation = async (conversationId: number) => {
    setIsAccepting(true);
    setErrorMessage(null);
    try {
      const res = await supportChatController.acceptConversation(conversationId);
      if (res.data) {
        await loadConversations();
        selectConversation(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ca này đã có đồng nghiệp khác tiếp nhận.');
      loadConversations();
    } finally {
      setIsAccepting(false);
    }
  };

  // Kết nối WebSocket STOMP
  useEffect(() => {
    if (!userId) {
      if (clientRef.current) {
        clientRef.current.deactivate().catch(() => {});
        clientRef.current = null;
      }
      return;
    }

    loadConversations();
    loadHistoryConversations();

    let isSubscribed = true;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(BASE_WS_URL),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      reconnectDelay: 5000,
      onConnect: () => {
        if (!isSubscribed) return;

        stompClient.subscribe('/topic/support-queue', (frame: IMessage) => {
          if (!isSubscribed) return;
          // Kênh /topic/support-queue dùng để đồng bộ hàng đợi tư vấn trực tiếp cho toàn bộ nhân viên/quản trị viên
          loadConversations();
          loadHistoryConversations();
        });

        stompClient.subscribe('/user/queue/support-chat', (frame: IMessage) => {
          if (!frame.body || !isSubscribed) return;
          try {
            const newMsg: SupportMessage = JSON.parse(frame.body);
            const currentActive = activeConversationRef.current;

            if (newMsg.senderRole === 'CUSTOMER') {
              playNotificationSound();
              if (!currentActive || currentActive.id !== newMsg.conversationId) {
                toast.info(`💬 Tin nhắn mới từ ${newMsg.senderName || 'Khách hàng'}`, {
                  description: newMsg.content || '[Hình ảnh đính kèm]',
                  duration: 5000,
                });
              }
            }
            if (currentActive && currentActive.id === newMsg.conversationId) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
              supportChatController.markStaffAsRead(newMsg.conversationId);

              // Cập nhật trạng thái và mã đơn hàng active conversation realtime
              if (newMsg.conversationStatus || newMsg.orderId || newMsg.orderCode) {
                setActiveConversation((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: (newMsg.conversationStatus as any) || prev.status,
                        orderId: newMsg.orderId ?? prev.orderId,
                        orderCode: newMsg.orderCode ?? prev.orderCode,
                      }
                    : prev
                );
              }
            }

            // Đồng bộ trạng thái và mã đơn hàng vào danh sách myConversations
            setMyConversations((prev) =>
              prev.map((c) => {
                if (c.id === newMsg.conversationId) {
                  return {
                    ...c,
                    status: newMsg.conversationStatus ? (newMsg.conversationStatus as any) : c.status,
                    orderId: newMsg.orderId ?? c.orderId,
                    orderCode: newMsg.orderCode ?? c.orderCode,
                    lastMessageAt: newMsg.createdAt,
                    unreadCount:
                      currentActive?.id === newMsg.conversationId
                        ? 0
                        : (c.unreadCount || 0) + 1,
                  };
                }
                return c;
              })
            );

            // Đồng bộ vào historyConversations nếu ca đã đóng/hoàn tất
            if (newMsg.conversationStatus === 'RESOLVED' || newMsg.conversationStatus === 'CLOSED') {
              loadHistoryConversations();
            }
          } catch (e) {
            console.error('Lỗi parse tin nhắn support WebSocket:', e);
          }
        });
      },
      onStompError: (frame) => {
        const errMsg = frame.headers['message'] || '';
        if (errMsg.includes('Session closed')) return;
        console.warn('[StaffSupport STOMP] Thông báo broker:', errMsg);
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      isSubscribed = false;
      stompClient.deactivate().catch(() => {});
      clientRef.current = null;
    };
  }, [userId, loadConversations, loadHistoryConversations]);

  // Chọn ảnh để chuẩn bị gửi trong chat
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

  // Gửi tin nhắn phản hồi từ ô chat
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation) return;

    const trimmed = chatInputText.trim();
    if (!trimmed && !selectedImageFile) return;

    setIsSending(true);
    setErrorMessage(null);
    let attachmentUrl: string | undefined = undefined;

    try {
      if (selectedImageFile) {
        setIsUploadingImage(true);
        const uploadResult = await supportChatController.uploadMessageImage(selectedImageFile);
        attachmentUrl = uploadResult.url;
        setIsUploadingImage(false);
      }

      const res = await supportChatController.sendStaffMessage(activeConversation.id, {
        content: trimmed || undefined,
        attachmentUrl,
      });

      if (res.data) {
        const savedMsg = res.data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === savedMsg.id)) return prev;
          return [...prev, savedMsg];
        });
        setChatInputText('');
        clearSelectedImage();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi tin nhắn.');
    } finally {
      setIsSending(false);
      setIsUploadingImage(false);
    }
  };

  // Modal Hoàn tất / giải quyết ca (RESOLVE)
  const openResolveModal = () => {
    if (!activeConversation) return;
    setErrorMessage(null);
    setIsResolveModalOpen(true);
  };

  const closeResolveModal = () => {
    if (isResolving) return;
    setIsResolveModalOpen(false);
    setErrorMessage(null);
  };

  const resolveConversation = async () => {
    if (!activeConversation) return;

    setIsResolving(true);
    setErrorMessage(null);
    try {
      const res = await supportChatController.resolveConversation(activeConversation.id);
      if (res.data) {
        setActiveConversation(res.data);
        await loadConversations();
        setIsResolveModalOpen(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi kết thúc ca.');
    } finally {
      setIsResolving(false);
    }
  };

  // Logic Modal Báo Cáo Vi Phạm (Report)
  const openReportModal = () => {
    setReportReason('');
    setReportFiles([]);
    setReportPreviews([]);
    setReportingMessageId(null);
    setErrorMessage(null);
    setIsReportModalOpen(true);
  };

  const handleQuickReport = useCallback((msg: SupportMessage) => {
    // Nếu tin nhắn này đã được gửi báo cáo trước đó, không mở lại
    if (reportedMessageIds.has(msg.id)) return;

    setReportingMessageId(msg.id);
    const reasonText = msg.isViolation
      ? (msg.violationReason || 'Ngôn từ vi phạm chuẩn mực cộng đồng')
      : 'Khách hàng có hành vi không chuẩn mực trong cuộc trò chuyện';
    const quote = msg.originalContent || msg.content || '';
    setReportReason(
      msg.isViolation
        ? `[Báo Cáo Nhanh - AI Cảnh Báo]: ${reasonText}. Nội dung vi phạm: "${quote}"`
        : `[Báo Cáo Nhanh]: ${reasonText}. Trích dẫn tin nhắn: "${quote}"`
    );
    setReportFiles([]);
    setReportPreviews([]);
    setErrorMessage(null);
    setIsReportModalOpen(true);
  }, [reportedMessageIds]);

  const toggleRevealOriginalContent = useCallback((msgId: number) => {
    setRevealedMessageIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  }, []);

  const closeReportModal = () => {
    if (isReporting) return;
    setIsReportModalOpen(false);
    setReportingMessageId(null);
    setErrorMessage(null);
  };

  const handleReportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    if (reportFiles.length + selected.length > 3) {
      setErrorMessage('Chỉ được đính kèm tối đa 3 ảnh bằng chứng vi phạm.');
      return;
    }

    const newFiles = [...reportFiles, ...selected].slice(0, 3);
    setReportFiles(newFiles);

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setReportPreviews(newPreviews);
  };

  const removeReportFile = (index: number) => {
    const updatedFiles = reportFiles.filter((_, i) => i !== index);
    setReportFiles(updatedFiles);
    const updatedPreviews = updatedFiles.map((f) => URL.createObjectURL(f));
    setReportPreviews(updatedPreviews);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation) return;
    if (!reportReason.trim()) {
      setErrorMessage('Vui lòng nhập lý do báo cáo vi phạm.');
      return;
    }

    setIsReporting(true);
    setErrorMessage(null);
    try {
      let evidenceImageUrls: string[] = [];
      if (reportFiles.length > 0) {
        evidenceImageUrls = await supportChatController.uploadReportEvidence(reportFiles);
      }

      const payload: CreateSupportReportRequest = {
        reason: reportReason.trim(),
        evidenceImageUrls,
      };

      const res = await supportChatController.reportCustomer(activeConversation.id, payload);
      if (res.data) {
        // Khóa nút báo cáo nhanh cho tin nhắn vừa báo cáo (nếu có)
        if (reportingMessageId) {
          setReportedMessageIds((prev) => new Set(prev).add(reportingMessageId));
          setReportingMessageId(null);
        }

        // Cập nhật trạng thái hasPendingReport ngay trên ca đang chat
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                hasPendingReport: true,
                pendingReportId: res.data?.id,
                pendingReportReason: res.data?.reason,
                pendingReportEvidenceUrls: res.data?.evidenceImageUrls,
                pendingReportedByStaffName: res.data?.reportedByStaffName,
                pendingReportCreatedAt: res.data?.createdAt,
              }
            : prev
        );

        // Đồng bộ vào myConversations
        setMyConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id ? { ...c, hasPendingReport: true } : c
          )
        );

        setIsReportModalOpen(false);
        setReportReason('');
        setReportFiles([]);
        setReportPreviews([]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi báo cáo vi phạm.');
    } finally {
      setIsReporting(false);
    }
  };

  // =========================================================================
  // LOGIC PHÊ DUYỆT BÁO CÁO VI PHẠM DÀNH CHO ADMIN
  // =========================================================================

  const openAdminReviewModal = useCallback(() => {
    setAdminReviewNote('');
    setIsBanCustomerChecked(true);
    setErrorMessage(null);
    setIsAdminReviewModalOpen(true);
  }, []);

  const closeAdminReviewModal = useCallback(() => {
    if (isProcessingReport) return;
    setIsAdminReviewModalOpen(false);
    setErrorMessage(null);
  }, [isProcessingReport]);

  const handleAdminProcessReport = async () => {
    if (!activeConversation?.pendingReportId) {
      setErrorMessage('Không tìm thấy mã báo cáo vi phạm để phê duyệt.');
      return;
    }

    setIsProcessingReport(true);
    setErrorMessage(null);
    try {
      const res = await adminSupportReportController.processReport(
        activeConversation.pendingReportId,
        {
          banCustomer: isBanCustomerChecked,
          adminNote: adminReviewNote.trim() || undefined,
        }
      );

      if (res.data) {
        setIsAdminReviewModalOpen(false);
        setAdminReviewNote('');

        // Cập nhật trạng thái ca: Nếu ban thì chuyển sang CLOSED, giải phóng hasPendingReport
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                hasPendingReport: false,
                pendingReportId: undefined,
                status: isBanCustomerChecked ? 'CLOSED' : prev.status,
              }
            : prev
        );

        setMyConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  hasPendingReport: false,
                  status: isBanCustomerChecked ? 'CLOSED' : c.status,
                }
              : c
          )
        );

        await loadConversations();
        await loadHistoryConversations();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể phê duyệt báo cáo vi phạm.');
    } finally {
      setIsProcessingReport(false);
    }
  };

  const handleAdminRejectReport = async () => {
    if (!activeConversation?.pendingReportId) {
      setErrorMessage('Không tìm thấy mã báo cáo vi phạm để xử lý.');
      return;
    }

    if (!adminReviewNote.trim()) {
      setErrorMessage('Vui lòng nhập lý do từ chối/bác bỏ báo cáo để nhân viên hỗ trợ nắm thông tin.');
      return;
    }

    setIsProcessingReport(true);
    setErrorMessage(null);
    try {
      const res = await adminSupportReportController.rejectReport(
        activeConversation.pendingReportId,
        {
          adminNote: adminReviewNote.trim(),
        }
      );

      if (res.data) {
        setIsAdminReviewModalOpen(false);
        setAdminReviewNote('');

        // Giải phóng cờ hasPendingReport
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                hasPendingReport: false,
                pendingReportId: undefined,
              }
            : prev
        );

        setMyConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? { ...c, hasPendingReport: false }
              : c
          )
        );

        await loadConversations();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể bác bỏ báo cáo vi phạm.');
    } finally {
      setIsProcessingReport(false);
    }
  };

  // =========================================================================
  // LOGIC ADMIN KHÓA TRỰC TIẾP TÀI KHOẢN KHÁCH HÀNG (DIRECT BAN)
  // =========================================================================

  const openDirectBanModal = useCallback(() => {
    setDirectBanReason('');
    setErrorMessage(null);
    setIsDirectBanModalOpen(true);
  }, []);

  const closeDirectBanModal = useCallback(() => {
    if (isDirectBanning) return;
    setIsDirectBanModalOpen(false);
    setErrorMessage(null);
  }, [isDirectBanning]);

  const handleDirectBanCustomer = async () => {
    if (!activeConversation) return;

    setIsDirectBanning(true);
    setErrorMessage(null);
    try {
      // 1. Cập nhật trạng thái tài khoản người dùng sang banned (UserStatus.banned)
      await userController.updateUserStatus(activeConversation.customerId, 'banned');

      // 2. Tự động hoàn tất / đóng ca trò chuyện hiện tại nếu chưa đóng
      if (activeConversation.status !== 'RESOLVED' && activeConversation.status !== 'CLOSED') {
        await supportChatController.resolveConversation(activeConversation.id);
      }

      setIsDirectBanModalOpen(false);
      setDirectBanReason('');

      // Cập nhật trạng thái ca trên giao diện sang CLOSED
      setActiveConversation((prev) =>
        prev ? { ...prev, status: 'CLOSED' } : prev
      );

      setMyConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id ? { ...c, status: 'CLOSED' } : c
        )
      );

      await loadConversations();
      await loadHistoryConversations();
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi khóa tài khoản khách hàng.');
    } finally {
      setIsDirectBanning(false);
    }
  };

  /**
   * Gọi AI sinh gợi ý 3 câu trả lời nhanh theo ngữ cảnh tin nhắn gần nhất
   */
  const handleFetchAiSuggestions = useCallback(async () => {
    if (!messages || messages.length === 0) return;
    setIsLoadingAiSuggestions(true);
    try {
      const recentTextMessages = messages
        .filter((m) => m.content && m.content.trim().length > 0)
        .slice(-5)
        .map((m) => `${m.senderRole === 'CUSTOMER' ? 'Khách' : 'Nhân viên'}: ${m.content}`);

      const res = await adminAiController.suggestChatReplies({
        recentMessages: recentTextMessages,
        customerName: activeConversation?.customerName,
      });

      if (res?.data?.suggestions) {
        setAiSuggestions(res.data.suggestions);
      }
    } catch (err: any) {
      console.warn('Lỗi tải gợi ý câu trả lời AI:', err?.message);
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  }, [messages, activeConversation]);

  const handleApplyAiSuggestion = useCallback((suggestion: string) => {
    setChatInputText(suggestion);
  }, []);

  return {
    user,
    // Hàng đợi & ca
    queueTab,
    setQueueTab,
    waitingQueue,
    myConversations,
    historyConversations,
    activeConversation,
    messages,
    isLoadingQueue,
    isLoadingHistory,
    isLoadingMessages,
    isAccepting,
    isResolving,
    errorMessage,
    clearError: () => setErrorMessage(null),
    selectConversation,
    acceptConversation,
    resolveConversation,
    refreshQueue: loadConversations,
    loadHistoryConversations,
    // AI Smart Reply (Agent 5)
    aiSuggestions,
    isLoadingAiSuggestions,
    handleFetchAiSuggestions,
    handleApplyAiSuggestion,
    // Chat input & image upload
    chatInputText,
    setChatInputText,
    previewImageModalUrl,
    setPreviewImageModalUrl,
    selectedImagePreview,
    isSending,
    isUploadingImage,
    messagesEndRef,
    handleSelectImage,
    clearSelectedImage,
    handleSendChatMessage,
    // Modal Báo cáo vi phạm & Content Moderation
    isReportModalOpen,
    isReporting,
    reportReason,
    setReportReason,
    reportFiles,
    reportPreviews,
    openReportModal,
    closeReportModal,
    handleReportFileChange,
    removeReportFile,
    handleReportSubmit,
    handleQuickReport,
    revealedMessageIds,
    toggleRevealOriginalContent,
    // Modal Hoàn tất ca (Không dùng window.confirm)
    isResolveModalOpen,
    openResolveModal,
    closeResolveModal,
    // Phê duyệt Báo cáo vi phạm dành cho Admin & Chặn spam báo cáo
    isAdmin:
      user?.roleName === 'ADMIN' ||
      user?.role === 'ADMIN' ||
      (user as any)?.roleName === 'ROLE_ADMIN',
    reportedMessageIds,
    isAdminReviewModalOpen,
    isProcessingReport,
    adminReviewNote,
    setAdminReviewNote,
    isBanCustomerChecked,
    setIsBanCustomerChecked,
    openAdminReviewModal,
    closeAdminReviewModal,
    handleAdminProcessReport,
    handleAdminRejectReport,
    // Khóa tài khoản trực tiếp dành cho Admin (Direct Ban)
    isDirectBanModalOpen,
    directBanReason,
    setDirectBanReason,
    isDirectBanning,
    openDirectBanModal,
    closeDirectBanModal,
    handleDirectBanCustomer,
  };
}
