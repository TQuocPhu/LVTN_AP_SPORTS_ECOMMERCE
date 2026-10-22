import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aiService, ChatMessageMobile } from '../services/ai.service';

/**
 * Custom Hook cho Mobile App quản lý tính năng AI Sports Advisor
 * Tách biệt hoàn toàn logic khỏi UI Screen và Modal.
 */
export function useSportsAdvisorMobile(activeProductSlug?: string) {
  const [messages, setMessages] = useState<ChatMessageMobile[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [guestToken, setGuestToken] = useState('');

  // Lấy hoặc tạo guestToken
  useEffect(() => {
    async function initToken() {
      try {
        let token = await AsyncStorage.getItem('apsports_mobile_ai_guest');
        if (!token) {
          token = 'mobile_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
          await AsyncStorage.setItem('apsports_mobile_ai_guest', token);
        }
        setGuestToken(token);
      } catch {
        // Fallback
      }
    }
    initToken();
  }, []);

  // Lấy lịch sử hội thoại
  const loadHistory = useCallback(async () => {
    if (!guestToken) return;
    try {
      const history = await aiService.getChatHistory(guestToken);
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: 'welcome',
            sender: 'bot',
            text: 'Dạ AP Sports xin chào anh/chị! Em là Trợ lý AI Chuyên gia Thể thao. Anh/chị cho em biết chiều cao, cân nặng hoặc kích thước bàn chân để em tư vấn size chuẩn xác nhất nhé!',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: 'Dạ AP Sports xin chào anh/chị! Em có thể giúp gì cho mình về việc chọn size và đồ thể thao hôm nay ạ?',
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [guestToken]);

  const handleSendMessage = useCallback(
    async (customText?: string) => {
      const text = (customText || inputValue).trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessageMobile = {
        id: 'user_' + Date.now(),
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsLoading(true);

      try {
        const res = await aiService.askAdvisor(text, activeProductSlug, guestToken);
        const botMsg: ChatMessageMobile = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: res?.reply || 'Dạ em đã ghi nhận thông tin của mình ạ!',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err: any) {
        const errMsg: ChatMessageMobile = {
          id: 'err_' + Date.now(),
          sender: 'bot',
          text: 'Xin lỗi anh/chị, kết nối AI đang tạm thời gián đoạn. Anh/chị vui lòng thử gửi lại nhé!',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, activeProductSlug, guestToken]
  );

  return {
    messages,
    inputValue,
    isLoading,
    setInputValue,
    handleSendMessage,
    loadHistory,
  };
}
