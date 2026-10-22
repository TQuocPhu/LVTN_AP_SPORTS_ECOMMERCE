'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { adminAuthController } from '@/controllers/admin-auth-controller';
import { customerAiController } from '@/controllers/customer-ai-controller';
import { SuggestedProduct } from '@/types/ai';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  suggestedProducts?: SuggestedProduct[];
  isStreaming?: boolean;
}

/**
 * Loại bỏ toàn bộ ký tự ** (in đậm markdown) và chuyển đổi [Tên](/link) thành Tên thuần
 * để câu trả lời mộc mạc, tự nhiên, không rối mắt.
 */
function cleanAiText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .trim();
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    sender: 'bot',
    text: 'Xin chào bạn! 👋 Tôi là Trợ Lý Thể Thao AP Sports (Hỗ trợ bởi Google Gemini Flash). Tôi có thể hỗ trợ bạn tư vấn size chuẩn xác, chọn giày bóng đá, vợt cầu lông hoặc trang bị thể thao phù hợp.',
    timestamp: 'Vừa xong',
  },
];

export const QUICK_PROMPTS = [
  '⚽ Tư vấn giày đá bóng sân cỏ nhân tạo mưa ướt',
  '🏸 Cách chọn vợt cầu lông cho người mới',
  '👕 Mình cao 1m75 nặng 70kg mặc size nào?',
  '🔥 Sản phẩm nào đang được ưa chuộng nhất?',
];

export function useChatbot() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'live'>('ai');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [guestToken, setGuestToken] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedHistoryRef = useRef(false);

  // Tạo và lưu guestToken cho khách vãng lai
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('apsports_guest_ai_token');
      if (!token) {
        token = 'guest_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
        localStorage.setItem('apsports_guest_ai_token', token);
      }
      setGuestToken(token);
    }
  }, []);

  // Kiểm tra tài khoản Quản trị viên (ADMIN) - Nếu là Admin thì ẩn hoàn toàn Chatbot
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/demo')) {
      return;
    }
    let isMounted = true;
    adminAuthController
      .getCurrentAdmin()
      .then((res) => {
        if (isMounted && res?.data && res.data.roleName !== 'CUSTOMER') {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        // Không phải admin hoặc chưa đăng nhập
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Reset cờ khi guestToken thay đổi
  useEffect(() => {
    hasLoadedHistoryRef.current = false;
  }, [guestToken]);

  // Tải lịch sử hội thoại từ CSDL khi mở widget lần đầu
  useEffect(() => {
    if (!isOpen || !guestToken || hasLoadedHistoryRef.current) return;

    let isMounted = true;
    customerAiController
      .getChatHistory(guestToken)
      .then((res) => {
        if (isMounted) {
          hasLoadedHistoryRef.current = true;
          if (res?.data && res.data.length > 0) {
            const loaded: ChatMessage[] = res.data.map((m) => ({
              id: `msg-${m.id}`,
              sender: m.sender === 'user' ? 'user' : 'bot',
              text: m.message,
              timestamp: 'Gần đây',
              suggestedProducts: m.suggestedProducts || [],
            }));
            setMessages(loaded);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen, guestToken]);

  // Theo dõi vị trí cuộn trang để điều khiển trạng thái hiển thị nút Back To Top
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto scroll xuống tin nhắn mới nhất trong khung chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

  /**
   * Hiệu ứng trượt lướt mượt mà lên đầu trang (Custom Ease-In-Out Smooth Scroll)
   */
  const smoothScrollToTop = useCallback(() => {
    const startPosition = window.scrollY || document.documentElement.scrollTop;
    if (startPosition === 0) return;

    const startTime = performance.now();
    const duration = 700;

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);

      window.scrollTo(0, startPosition * (1 - easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, []);

  const toggleChatbot = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeChatbot = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openChatbot = useCallback(() => {
    setIsOpen(true);
  }, []);

  const sendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || inputText).trim();
      if (!text || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: 'Vừa xong',
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);

      try {
        // Gọi thật tới Backend qua customerAiController kết nối Gemini Flash
        const res = await customerAiController.askAdvisor({
          question: text,
          guestToken,
        });

        const rawReply =
          res?.data?.reply ||
          'Dạ em đã ghi nhận thông tin. Anh/chị có thể xem các sản phẩm được gợi ý bên dưới hoặc tiếp tục trò chuyện nhé!';

        // Làm sạch toàn bộ dấu ** và link markdown thô
        const finalReply = cleanAiText(rawReply);
        const suggested = res?.data?.suggestedProducts || [];

        const botId = `bot-${Date.now()}`;

        // Tắt typing indicator (3 dấu chấm) và tạo tin nhắn bot với trạng thái isStreaming = true
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: botId,
            sender: 'bot',
            text: '',
            timestamp: 'Vừa xong',
            isStreaming: true,
            suggestedProducts: [],
          },
        ]);

        // Cơ chế chữ chạy Typewriter Effect theo từng từ (word-by-word) nhịp nhàng như ChatGPT
        const words = finalReply.split(/(\s+)/);
        let currentIndex = 0;
        let accumulated = '';

        const timer = setInterval(() => {
          if (currentIndex < words.length) {
            accumulated += words[currentIndex];
            currentIndex++;
            const textToUpdate = accumulated;

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botId ? { ...msg, text: textToUpdate } : msg
              )
            );
          } else {
            clearInterval(timer);
            // Kết thúc chạy chữ: tắt streaming và hiển thị thẻ sản phẩm gợi ý
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botId
                  ? {
                      ...msg,
                      text: finalReply,
                      isStreaming: false,
                      suggestedProducts: suggested,
                    }
                  : msg
              )
            );
          }
        }, 22);
      } catch (err: any) {
        setIsTyping(false);
        const errorReply: ChatMessage = {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: 'Xin lỗi anh/chị, hệ thống AI đang tạm thời gián đoạn kết nối. Anh/chị vui lòng thử gửi lại câu hỏi hoặc chuyển sang tab Tư Vấn Trực Tiếp để chat cùng nhân viên nhé!',
          timestamp: 'Vừa xong',
        };
        setMessages((prev) => [...prev, errorReply]);
      }
    },
    [inputText, isTyping, guestToken]
  );

  const selectQuickPrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  }, [sendMessage]);

  return {
    isAdmin,
    isOpen,
    activeTab,
    setActiveTab,
    inputText,
    messages,
    isTyping,
    isScrolled,
    messagesEndRef,
    setInputText,
    toggleChatbot,
    closeChatbot,
    openChatbot,
    sendMessage,
    selectQuickPrompt,
    smoothScrollToTop,
    handleSubmit,
  };
}
