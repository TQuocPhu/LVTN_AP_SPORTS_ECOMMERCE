'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { adminAuthController } from '@/controllers/admin-auth-controller';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome-1',
    sender: 'bot',
    text: 'Xin chào bạn! 👋 Tôi là Trợ Lý Thể Thao AP Sports. Tôi có thể hỗ trợ bạn tư vấn chọn giày bóng đá, vợt cầu lông, võ phục hoặc chính sách bảo hành.',
    timestamp: 'Vừa xong',
  },
];

export const QUICK_PROMPTS = [
  '⚽ Tư vấn giày đá bóng sân cỏ nhân tạo',
  '🏸 Cách chọn vợt cầu lông cho người mới',
  '🥋 Bảng size võ phục Karate chuẩn',
  '📦 Chính sách đổi size miễn phí 30 ngày',
];

export function useChatbot() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'live'>('ai');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Kiểm tra tài khoản Quản trị viên (ADMIN) - Nếu là Admin thì ẩn hoàn toàn Chatbot
  useEffect(() => {
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
   * Sử dụng thuật toán Cubic Easing qua requestAnimationFrame
   */
  const smoothScrollToTop = useCallback(() => {
    const startPosition = window.scrollY || document.documentElement.scrollTop;
    if (startPosition === 0) return;

    const startTime = performance.now();
    const duration = 700; // 700ms lướt êm ái

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

  const sendMessage = useCallback((textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Giả lập bot phản hồi sẵn sàng cho việc tích hợp API sau này
    setTimeout(() => {
      const botReply: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Cảm ơn câu hỏi của bạn! Tính năng Chatbot AI đang được kết nối với hệ sinh thái AP Sports. Nếu bạn cần hỗ trợ gấp, vui lòng bấm gọi Hotline 0913.193.009 hoặc gửi biểu mẫu tại trang Liên Hệ nhé! 🚀',
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 700);
  }, [inputText]);

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
