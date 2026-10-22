import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSportsAdvisorMobile } from '../../hooks/useSportsAdvisorMobile';

interface AiSportsAdvisorModalProps {
  visible: boolean;
  onClose: () => void;
  productSlug?: string;
  productName?: string;
}

/**
 * UI Component: Modal Trợ lý AI Tư Vấn Thể Thao & Size trên Mobile App (Agent 1)
 * Tuân thủ nghiêm ngặt: Nhận dữ liệu & actions từ useSportsAdvisorMobile hook.
 */
export const AiSportsAdvisorModal: React.FC<AiSportsAdvisorModalProps> = ({
  visible,
  onClose,
  productSlug,
  productName,
}) => {
  const { messages, inputValue, isLoading, setInputValue, handleSendMessage, loadHistory } =
    useSportsAdvisorMobile(productSlug);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible, loadHistory]);

  const quickChips = [
    '👟 Chân bè ngang chọn size nào?',
    '📏 Tư vấn size theo chiều cao, cân nặng',
    '⚡ Giày này có chống trơn trượt không?',
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="sparkles" size={20} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Sports Advisor</Text>
              <Text style={styles.headerSubtitle}>
                {productName ? `Đang hỏi về: ${productName}` : 'Tư vấn size & đồ thể thao chuẩn xác'}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View style={[styles.bubbleContainer, isUser ? styles.bubbleUserContainer : styles.bubbleBotContainer]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                  <Text style={[styles.bubbleText, isUser ? styles.textUser : styles.textBot]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>AI đang phân tích thông số...</Text>
              </View>
            ) : null
          }
        />

        {/* Quick Chips */}
        <View style={styles.chipsRow}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={quickChips}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSendMessage(item)}
                disabled={isLoading}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Hỏi về chiều cao, cân nặng, cỡ chân..."
            placeholderTextColor="#94a3b8"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputValue.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    maxWidth: 240,
  },
  closeBtn: {
    padding: 6,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  bubbleContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bubbleUserContainer: {
    justifyContent: 'flex-end',
  },
  bubbleBotContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textUser: {
    color: '#fff',
  },
  textBot: {
    color: '#1e293b',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadingText: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  chipsRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipText: {
    fontSize: 12,
    color: '#334155',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
