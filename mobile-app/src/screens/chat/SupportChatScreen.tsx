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
  Image,
  ScrollView,
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
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

const ORDER_STATUS_MAP: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang chuẩn bị',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

function getOrderProductSummary(order: Order): string {
  const items = order.items || [];
  if (items.length === 0) return `Đơn hàng #${order.orderCode}`;
  const firstName = items[0].productName || 'Sản phẩm thể thao';
  if (items.length === 1) return firstName;
  return `${firstName} (+${items.length - 1} SP khác)`;
}

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
    liveConversation,
    liveMessages,
    loadingLive,
    isSending,
    myOrders,
    loadingOrders,
    isOrderPickerOpen,
    selectedOrder,
    toggleOrderPicker,
    closeOrderPicker,
    handleSelectOrder,
    clearSelectedOrder,
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
          {/* Thanh trạng thái phiên Live & Mã đơn hàng đang gắn */}
          {chatMode === 'live' && liveConversation?.orderCode && (
            <View style={[styles.linkedOrderBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="cube" size={14} color={Colors.primary} />
              <Text style={[styles.linkedOrderText, { color: colors.text }]}>
                Đang hỗ trợ đơn hàng:{' '}
                <Text style={styles.linkedOrderCode}>#{liveConversation.orderCode}</Text>
              </Text>
            </View>
          )}

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
                const role = liveItem.senderRole || liveItem.senderType;
                const isUser = role === 'CUSTOMER';
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

          {/* Khung chọn đơn hàng của khách (hiển thị ảnh SP + tên SP mua + mã đơn + tổng tiền + trạng thái) */}
          {chatMode === 'live' && isOrderPickerOpen && (
            <View style={[styles.orderPickerSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.orderPickerHeader, { borderBottomColor: colors.border }]}>
                <View style={styles.orderPickerTitleRow}>
                  <Ionicons name="cube" size={16} color={Colors.primary} />
                  <Text style={[styles.orderPickerTitle, { color: colors.text }]}>
                    Chọn đơn hàng bạn cần hỗ trợ
                  </Text>
                </View>
                <TouchableOpacity onPress={closeOrderPicker} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {loadingOrders ? (
                <View style={styles.orderPickerEmpty}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={[styles.orderPickerEmptyText, { color: colors.textMuted }]}>
                    Đang tải đơn hàng của bạn...
                  </Text>
                </View>
              ) : myOrders.length === 0 ? (
                <View style={styles.orderPickerEmpty}>
                  <Text style={[styles.orderPickerEmptyText, { color: colors.textMuted }]}>
                    Bạn chưa có đơn hàng nào để đính kèm.
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.orderPickerList} showsVerticalScrollIndicator={false}>
                  {myOrders.map((order) => {
                    const firstItem = order.items?.[0];
                    const isSelected = selectedOrder?.id === order.id;
                    const statusText = ORDER_STATUS_MAP[order.status] || order.status;

                    return (
                      <TouchableOpacity
                        key={order.id}
                        style={[
                          styles.orderPickerItem,
                          {
                            backgroundColor: isSelected ? Colors.primaryMuted : colors.background,
                            borderColor: isSelected ? Colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => handleSelectOrder(order)}
                        activeOpacity={0.8}
                      >
                        {firstItem?.image ? (
                          <Image source={{ uri: firstItem.image }} style={styles.orderThumb} />
                        ) : (
                          <View style={[styles.orderThumbPlaceholder, { backgroundColor: Colors.primaryMuted }]}>
                            <Ionicons name="cube-outline" size={18} color={Colors.primary} />
                          </View>
                        )}

                        <View style={styles.orderInfoCol}>
                          <Text style={[styles.orderProductTitle, { color: colors.text }]} numberOfLines={1}>
                            {getOrderProductSummary(order)}
                          </Text>
                          <Text style={[styles.orderMetaLine, { color: colors.textMuted }]} numberOfLines={1}>
                            <Text style={styles.orderCodeHighlight}>#{order.orderCode}</Text> •{' '}
                            {formatCurrency(order.finalAmount || 0)}
                          </Text>
                        </View>

                        <View style={styles.orderStatusBadge}>
                          <Text style={styles.orderStatusBadgeText}>{statusText}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}

          {/* Thanh Preview Đơn Hàng Đã Chọn (chờ khách bấm Gửi mới gửi đi) */}
          {chatMode === 'live' && selectedOrder && (
            <View style={styles.selectedOrderPreviewBar}>
              {selectedOrder.items?.[0]?.image ? (
                <Image source={{ uri: selectedOrder.items[0].image }} style={styles.previewOrderThumb} />
              ) : (
                <View style={styles.previewOrderThumbFallback}>
                  <Ionicons name="cube" size={16} color={Colors.primary} />
                </View>
              )}
              <View style={styles.previewOrderTextCol}>
                <Text style={styles.previewOrderTitle} numberOfLines={1}>
                  {getOrderProductSummary(selectedOrder)}
                </Text>
                <Text style={styles.previewOrderSub} numberOfLines={1}>
                  Đính kèm #{selectedOrder.orderCode} • {formatCurrency(selectedOrder.finalAmount || 0)} (Bấm Gửi để xác nhận)
                </Text>
              </View>
              <TouchableOpacity
                onPress={clearSelectedOrder}
                style={styles.previewOrderClearBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={14} color={Colors.slate600} />
              </TouchableOpacity>
            </View>
          )}

          {/* Thanh nhập tin nhắn */}
          <ChatInputBar
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSendMessage}
            sending={isSending}
            showOrderButton={chatMode === 'live'}
            isOrderPickerActive={isOrderPickerOpen || !!selectedOrder}
            hasAttachment={chatMode === 'live' && !!selectedOrder}
            onToggleOrderPicker={toggleOrderPicker}
            placeholder={
              chatMode === 'ai'
                ? 'Hỏi trợ lý AI về giày, vợt, võ phục...'
                : selectedOrder
                ? `Hỏi thêm về đơn #${selectedOrder.orderCode} hoặc bấm Gửi...`
                : 'Nhập tin nhắn hoặc chọn đơn hàng cần hỗ trợ...'
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
  linkedOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  linkedOrderText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
  },
  linkedOrderCode: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  orderPickerSheet: {
    maxHeight: 220,
    borderTopWidth: 1,
    paddingBottom: 4,
  },
  orderPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  orderPickerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderPickerTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  orderPickerEmpty: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  orderPickerEmptyText: {
    fontSize: Typography.sizes.xs,
  },
  orderPickerList: {
    paddingHorizontal: Spacing.md,
    paddingTop: 6,
  },
  orderPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
  },
  orderThumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  orderThumbPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfoCol: {
    flex: 1,
  },
  orderProductTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  orderMetaLine: {
    fontSize: 10,
    marginTop: 2,
  },
  orderCodeHighlight: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  orderStatusBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  orderStatusBadgeText: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  selectedOrderPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Colors.primaryMuted,
    borderTopWidth: 1,
    borderTopColor: Colors.primary,
  },
  previewOrderThumb: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  previewOrderThumbFallback: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewOrderTextCol: {
    flex: 1,
  },
  previewOrderTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  previewOrderSub: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 1,
  },
  previewOrderClearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
