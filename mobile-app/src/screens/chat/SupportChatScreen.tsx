import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { Header } from '../../components/common/Header';
import { useSupportChat, QUICK_PROMPTS } from '../../hooks/useSupportChat';
import { ChatModeSwitch } from '../../components/chat/ChatModeSwitch';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { ChatQuickPrompts } from '../../components/chat/ChatQuickPrompts';
import { ChatInputBar } from '../../components/chat/ChatInputBar';
import { useTheme } from '../../context/ThemeContext';

export const SupportChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);
  const { colors } = useTheme();

  const {
    chatMode,
    setChatMode,
    inputText,
    setInputText,
    aiMessages,
    isAiTyping,
    liveMessages,
    loadingLive,
    isSending,
    handleSendMessage,
    handleQuickPrompt,
    isAuthenticated,
  } = useSupportChat();

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [aiMessages, liveMessages, isAiTyping]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}
    >
      <Header title="Tư Vấn & Hỗ Trợ AP Sports" showBack onBack={() => navigation.goBack()} />

      {/* Switch giữa AI Bot và Nhân viên CSKH */}
      <ChatModeSwitch chatMode={chatMode} onSelectMode={setChatMode} />

      {/* Chế độ Live Staff yêu cầu đăng nhập */}
      {chatMode === 'live' && !isAuthenticated ? (
        <View style={styles.authPromptBox}>
          <View style={styles.authIconCircle}>
            <Ionicons name="lock-closed" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.authPromptTitle}>Yêu Cầu Đăng Nhập</Text>
          <Text style={styles.authPromptDesc}>
            Vui lòng đăng nhập tài khoản khách hàng để kết nối bảo mật trực tiếp với chuyên viên tư vấn AP Sports.
          </Text>
          <TouchableOpacity
            style={styles.btnAuthLogin}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnAuthLoginText}>Đăng Nhập Ngay</Text>
          </TouchableOpacity>
        </View>
      ) : loadingLive && chatMode === 'live' ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang kết nối với nhân viên CSKH...</Text>
        </View>
      ) : (
        <>
          {/* Danh sách tin nhắn */}
          <FlatList
            ref={flatListRef}
            data={chatMode === 'ai' ? aiMessages : liveMessages}
            keyExtractor={(item, index) => String((item as any).id || index)}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              if (chatMode === 'ai') {
                const aiItem = item as any;
                return (
                  <ChatBubble
                    isUser={aiItem.sender === 'user'}
                    senderName={aiItem.sender === 'bot' ? 'Trợ lý AI' : undefined}
                    text={aiItem.text}
                    timestamp={aiItem.timestamp}
                  />
                );
              } else {
                const liveItem = item as any;
                const isUser = liveItem.senderType === 'CUSTOMER';
                return (
                  <ChatBubble
                    isUser={isUser}
                    senderName={!isUser ? liveItem.senderName || 'Chuyên viên CSKH' : undefined}
                    text={liveItem.content}
                    timestamp={new Date(liveItem.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  />
                );
              }
            }}
            ListFooterComponent={
              isAiTyping && chatMode === 'ai' ? (
                <View style={styles.typingBox}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.typingText}>Trợ lý AI đang soạn câu trả lời...</Text>
                </View>
              ) : undefined
            }

          />

          {/* Quick Prompts (dành cho chế độ AI) */}
          {chatMode === 'ai' && (
            <ChatQuickPrompts prompts={QUICK_PROMPTS} onSelectPrompt={handleQuickPrompt} />
          )}

          {/* Thanh nhập tin nhắn */}
          <ChatInputBar
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSendMessage}
            sending={isSending}
            placeholder={
              chatMode === 'ai'
                ? 'Hỏi trợ lý AI về giày, vợt, võ phục...'
                : 'Nhập tin nhắn gửi tới nhân viên CSKH...'
            }
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesList: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
  },
  typingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.slate100,
    borderRadius: BorderRadius.lg,
    marginVertical: 4,
  },
  typingText: {
    fontSize: 10,
    color: Colors.slate500,
    fontStyle: 'italic',
  },
  authPromptBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  authIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  authPromptTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
    marginBottom: Spacing.xs,
  },
  authPromptDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.xl,
  },
  btnAuthLogin: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  btnAuthLoginText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
