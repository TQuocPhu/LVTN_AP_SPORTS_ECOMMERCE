import { useState, useEffect, useCallback, useRef } from 'react';
import { supportChatController, SupportMessage, SupportConversation } from '../controllers/support-chat-controller';
import { useAuth } from '../context/AuthContext';

export interface LocalChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const QUICK_PROMPTS = [
  '⚽ Tư vấn giày đá bóng sân cỏ nhân tạo',
  '🏸 Cách chọn vợt cầu lông cho người mới',
  '🥋 Bảng size võ phục Karate chuẩn',
  '📦 Chính sách đổi size miễn phí 30 ngày',
];

const BOT_KNOWLEDGE: Record<string, string> = {
  '⚽': 'Dạ đối với sân cỏ nhân tạo Việt Nam, bạn nên chọn đế đinh dăm TF (Turf) để bám sân tốt và giảm chấn cổ chân. Các mẫu hot nhất tại AP Sports gồm Nike Mercurial Vapor và Mizuno Morelia Neo Pro TF ạ!',
  '🏸': 'Người mới chơi cầu lông nên ưu tiên vợt thân dẻo, trọng lượng 4U (80-84g), điểm cân bằng công thủ toàn diện (285-295mm) và lực căng lưới 9.5kg - 10.5kg để dễ vung vợt và không đau cổ tay.',
  '🥋': 'Võ phục Karate Kata/Kumite chuẩn AP Sports được may bằng vải Kaki cotton 100% thoáng khí, đường may 8 kim gia cố viền. Nếu bạn cao 1m65 - 1m70 nặng dưới 65kg hãy chọn size số 4 hoặc 5 nhé.',
  '📦': 'AP Sports hỗ trợ đổi trả size hoặc mẫu miễn phí trong 30 ngày đầu tiên nếu sản phẩm còn nguyên tem mác, hộp và chưa qua thi đấu thực tế ngoài sân cỏ.',
};

export const useSupportChat = () => {
  const { isAuthenticated, user } = useAuth();
  const [chatMode, setChatMode] = useState<'ai' | 'live'>('ai');
  const [inputText, setInputText] = useState<string>('');

  // AI Chat Messages
  const [aiMessages, setAiMessages] = useState<LocalChatMessage[]>([
    {
      id: 'bot-1',
      sender: 'bot',
      text: 'Xin chào bạn! 👋 Tôi là Trợ Lý Thể Thao AP Sports. Tôi có thể hỗ trợ bạn chọn giày bóng đá, vợt cầu lông, võ phục hoặc chuyển sang gặp Nhân viên hỗ trợ trực tiếp.',
      timestamp: 'Vừa xong',
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // Live Staff Chat Messages
  const [liveConversation, setLiveConversation] = useState<SupportConversation | null>(null);
  const [liveMessages, setLiveMessages] = useState<SupportMessage[]>([]);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Nạp ca hỗ trợ trực tuyến khi chuyển sang tab Live
  const fetchLiveChat = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingLive(true);
      const res = await supportChatController.getActiveConversation();
      if (res.data) {
        setLiveConversation(res.data);
        const msgRes = await supportChatController.getMessages(res.data.id);
        setLiveMessages(msgRes.data || []);
      }
    } catch {
      // bỏ qua lỗi
    } finally {
      setLoadingLive(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (chatMode === 'live') {
      fetchLiveChat();
    }
  }, [chatMode, fetchLiveChat]);

  // Gửi tin nhắn AI
  const handleSendAiMessage = useCallback((textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: LocalChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);

    // Tìm kiếm câu trả lời phù hợp
    setTimeout(() => {
      let botReply = 'Cảm ơn bạn đã đặt câu hỏi! Đội ngũ tư vấn thể thao AP Sports luôn sẵn sàng phục vụ. Bạn cũng có thể bấm vào tab "Gặp Nhân Viên" phía trên để chat trực tiếp với chuyên viên CSKH nhé!';
      for (const key of Object.keys(BOT_KNOWLEDGE)) {
        if (text.includes(key) || text.toLowerCase().includes(key.toLowerCase())) {
          botReply = BOT_KNOWLEDGE[key];
          break;
        }
      }
      if (text.toLowerCase().includes('giày') || text.toLowerCase().includes('bóng')) {
        botReply = BOT_KNOWLEDGE['⚽'];
      } else if (text.toLowerCase().includes('vợt') || text.toLowerCase().includes('cầu lông')) {
        botReply = BOT_KNOWLEDGE['🏸'];
      } else if (text.toLowerCase().includes('võ') || text.toLowerCase().includes('karate')) {
        botReply = BOT_KNOWLEDGE['🥋'];
      } else if (text.toLowerCase().includes('đổi') || text.toLowerCase().includes('trả') || text.toLowerCase().includes('bảo hành')) {
        botReply = BOT_KNOWLEDGE['📦'];
      }

      setAiMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsAiTyping(false);
    }, 700);
  }, []);

  // Gửi tin nhắn Live tới nhân viên
  const handleSendLiveMessage = useCallback(async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    try {
      setIsSending(true);
      let convId = liveConversation?.id;

      // Nếu chưa có ca hỗ trợ thì tạo ca mới
      if (!convId) {
        const convRes = await supportChatController.getOrCreateConversation('Tư vấn sản phẩm thể thao qua mobile');
        setLiveConversation(convRes.data);
        convId = convRes.data.id;
      }

      const res = await supportChatController.sendMessage(convId, text);
      setLiveMessages((prev) => [...prev, res.data]);
      setInputText('');
    } catch (err: any) {
      console.warn('Lỗi gửi tin nhắn trực tiếp:', err);
    } finally {
      setIsSending(false);
    }
  }, [liveConversation]);

  const handleSendMessage = useCallback(() => {
    if (chatMode === 'ai') {
      handleSendAiMessage(inputText);
    } else {
      handleSendLiveMessage(inputText);
    }
  }, [chatMode, inputText, handleSendAiMessage, handleSendLiveMessage]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    handleSendAiMessage(prompt);
  }, [handleSendAiMessage]);

  return {
    chatMode,
    setChatMode,
    inputText,
    setInputText,
    aiMessages,
    isAiTyping,
    liveConversation,
    liveMessages,
    loadingLive,
    isSending,
    handleSendMessage,
    handleQuickPrompt,
    isAuthenticated,
  };
};
