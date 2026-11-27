import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Spacing, Typography } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';
import {
  DELIVERY_REVIEW_QUICK_TAGS,
  useDeliveryReviewModal,
} from '../../hooks/useDeliveryReviewModal';
import { DeliveryReview } from '../../types';

interface DeliveryReviewModalProps {
  visible: boolean;
  orderCode: string;
  shipperName?: string | null;
  shippingProvider?: string | null;
  onClose: () => void;
  onSuccess: (review: DeliveryReview) => void;
}

export const DeliveryReviewModal: React.FC<DeliveryReviewModalProps> = ({
  visible,
  orderCode,
  shipperName,
  shippingProvider,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    scrollRef,
    keyboardHeight,
    modalMaxHeight,
    scrollToEndOnFocus,
    rating,
    setRating,
    selectedTags,
    toggleTag,
    comment,
    setComment,
    submitting,
    ratingLabel,
    handleSubmit,
  } = useDeliveryReviewModal({ orderCode, onSuccess, onClose });

  const modalBottomPad = Math.max(
    keyboardHeight,
    Platform.OS === 'android' ? Math.max(insets.bottom, 48) : insets.bottom
  );

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingBottom: modalBottomPad }]}>
        <View style={[styles.sheet, { backgroundColor: colors.card, maxHeight: modalMaxHeight }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBox, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="bicycle" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text }]}>
                  Đánh Giá Giao Hàng (Shipper)
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  Đơn #{orderCode} • {shipperName || `Shipper ${shippingProvider || 'GHN'}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: Spacing.lg }}
          >
            {/* Stars */}
            <View style={styles.starSection}>
              <Text style={[styles.promptText, { color: colors.textMuted }]}>
                Bạn hài lòng với quá trình giao hàng chứ?
              </Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.75}
                    style={{ padding: 4 }}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? '#f59e0b' : colors.textFaint}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.ratingLabel, { color: colors.primary }]}>{ratingLabel}</Text>
            </View>

            {/* Quick Tags */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Điểm bạn ấn tượng nhất:
            </Text>
            <View style={styles.tagWrap}>
              {DELIVERY_REVIEW_QUICK_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.8}
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: selected ? colors.primaryMuted : colors.surface2,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {selected && (
                      <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                    )}
                    <Text
                      style={[
                        styles.tagText,
                        { color: selected ? colors.primary : colors.textSecondary },
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Comment */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>
              Nhận xét thêm (không bắt buộc):
            </Text>
            <TextInput
              style={[
                styles.commentInput,
                { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="Ví dụ: Anh shipper gọi điện trước 15 phút, giao hàng nhanh..."
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
              onFocus={scrollToEndOnFocus}
            />

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.btnLater, { backgroundColor: colors.surface2, borderColor: colors.border }]}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={[styles.btnLaterText, { color: colors.textSecondary }]}>Để Sau</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSubmit, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.btnSubmitText}>Gửi Đánh Giá</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  starSection: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  promptText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: Spacing.xs,
  },
  ratingLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.black,
  },
  fieldLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    minHeight: 74,
    fontSize: Typography.sizes.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  btnLater: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnLaterText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  btnSubmit: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  btnSubmitText: {
    color: '#ffffff',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
