import { useState, useEffect, useCallback, useRef } from 'react';
import { customerAiController } from '@/controllers/customer-ai-controller';
import { SuggestedProduct } from '@/types/ai';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedProducts?: SuggestedProduct[];
  isStreaming?: boolean;
}

/**
 * Loại bỏ ký tự ** và chuyển link markdown thành chữ thường
 */
function cleanAiText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .trim();
}

/**
 * Custom Hook quản lý toàn bộ nghiệp vụ giao diện của Trợ lý AI Sports Advisor (Agent 1)
 * Tuân thủ nghiêm ngặt: UI Components không chứa useState/useEffect, toàn bộ state nằm tại Hook này.
 */
export function useSportsAdvisor(activeProductSlug?: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guestToken, setGuestToken] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedHistoryRef = useRef(false);

  useEffect(() => {
    hasLoadedHistoryRef.current = false;
  }, [guestToken]);

  // Khởi tạo guestToken nếu chưa đăng nhập và tải lịch sử tin nhắn
  useEffect(() => {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('apsports_guest_ai_token') || '';
      if (!token) {
        token = 'guest_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
        localStorage.setItem('apsports_guest_ai_token', token);
      }
      setGuestToken(token);
    }
  }, []);

  // Tải lịch sử chat khi mở widget
  useEffect(() => {
    if (!isOpen || !guestToken || hasLoadedHistoryRef.current) return;

    let isMounted = true;
    async function loadHistory() {
      try {
        const res = await customerAiController.getChatHistory(guestToken);
        if (isMounted) {
          hasLoadedHistoryRef.current = true;
          if (res?.data && res.data.length > 0) {
            const mapped: ChatMessageItem[] = res.data.map((m) => ({
              id: String(m.id),
              sender: m.sender === 'user' ? 'user' : 'bot',
              text: m.message,
              timestamp: m.createdAt,
              suggestedProducts: m.suggestedProducts || [],
            }));
            setMessages(mapped);
          } else if (messages.length === 0) {
            // Lời chào mặc định đầu tiên
            setMessages([
              {
                id: 'welcome',
                sender: 'bot',
                text: 'Dạ AP Sports xin chào anh/chị! Em là Trợ lý Chuyên gia Thể thao AI. Em có thể hỗ trợ anh/chị chọn size chuẩn xác (theo chiều cao, cân nặng, form chân) hoặc tư vấn trang bị thể thao phù hợp nhất hôm nay ạ!',
                timestamp: new Date().toISOString(),
              },
            ]);
          }
        }
      } catch (err) {
        // Fallback lời chào
        if (isMounted && messages.length === 0) {
          setMessages([
            {
              id: 'welcome',
              sender: 'bot',
              text: 'Dạ em chào anh/chị! Anh/chị cần em hỗ trợ tư vấn chọn size giày, quần áo hay dụng cụ tập luyện nào ạ?',
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, [isOpen, guestToken]);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleInputChange = useCallback((val: string) => {
    setInputValue(val);
  }, []);

  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || inputValue).trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessageItem = {
        id: 'user_' + Date.now(),
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsLoading(true);

      try {
        const res = await customerAiController.askAdvisor({
          question: text,
          activeProductSlug,
          guestToken,
        });

        const rawReply =
          res?.data?.reply ||
          'Dạ em đã ghi nhận yêu cầu của mình. Anh/chị có thể xem các gợi ý sản phẩm bên dưới hoặc cho em biết thêm chi tiết để em tư vấn kỹ hơn nhé!';

        const finalReply = cleanAiText(rawReply);
        const suggested = res?.data?.suggestedProducts || [];

        const botId = 'bot_' + Date.now();

        // Tắt loading indicator và tạo bot message rỗng với isStreaming = true
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: botId,
            sender: 'bot',
            text: '',
            timestamp: new Date().toISOString(),
            isStreaming: true,
            suggestedProducts: [],
          },
        ]);

        // Typewriter Effect theo từng từ
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
      } catch (error) {
        setIsLoading(false);
        const errorMsg: ChatMessageItem = {
          id: 'err_' + Date.now(),
          sender: 'bot',
          text: 'Xin lỗi anh/chị, đường truyền kết nối AI đang tạm thời gián đoạn. Anh/chị vui lòng thử gửi lại câu hỏi sau giây lát nhé ạ!',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    },
    [inputValue, isLoading, activeProductSlug, guestToken]
  );

  return {
    isOpen,
    messages,
    inputValue,
    isLoading,
    messagesEndRef,
    toggleOpen,
    handleInputChange,
    handleSendMessage,
  };
}
