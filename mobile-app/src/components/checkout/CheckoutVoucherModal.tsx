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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Typography } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  CheckoutVoucherTab,
  CheckoutEligibleVoucher,
  CheckoutIneligibleVoucher,
} from '../../types';

interface CheckoutVoucherModalProps {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  applying: boolean;
  searchQuery: string;
  onChangeSearch: (q: string) => void;
  tabFilter: CheckoutVoucherTab;
  onChangeTab: (tab: CheckoutVoucherTab) => void;
  totalAmount: number;
  shippingFee: number;
  appliedCode?: string;
  modalError: string | null;
  eligibleVouchers: CheckoutEligibleVoucher[];
  ineligibleVouchers: CheckoutIneligibleVoucher[];
  onRefresh: () => void;
  onSelectVoucher: (code: string) => void;
}

/**
 * Modal chọn nhanh Voucher trên Mobile App (thuần UI, hỗ trợ Dark/Light mode).
 */
export const CheckoutVoucherModal: React.FC<CheckoutVoucherModalProps> = ({
  visible,
  onClose,
  loading,
  applying,
  searchQuery,
  onChangeSearch,
  tabFilter,
  onChangeTab,
  totalAmount,
  shippingFee,
  appliedCode,
  modalError,
  eligibleVouchers,
  ineligibleVouchers,
  onRefresh,
  onSelectVoucher,
}) => {
  const { colors } = useTheme();

  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <Ionicons name="ticket" size={20} color={colors.primary} />
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Chọn Voucher AP Sports</Text>
                <Text style={[styles.headerSub, { color: colors.textMuted }]}>
                  Đơn: {formatCurrency(totalAmount)} • Ship: {formatCurrency(shippingFee)}
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={onRefresh} disabled={loading} style={styles.iconBtn}>
                <Ionicons name="refresh" size={18} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search & Tabs */}
          <View style={[styles.filterArea, { borderBottomColor: colors.border }]}>
            <View style={[styles.searchBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
              <Ionicons name="search" size={16} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Tìm mã hoặc tên khuyến mãi..."
                placeholderTextColor={colors.textFaint}
                value={searchQuery}
                onChangeText={onChangeSearch}
              />
            </View>

            <View style={styles.tabRow}>
              {[
                { id: 'ALL' as CheckoutVoucherTab, label: 'Tất Cả' },
                { id: 'DISCOUNT' as CheckoutVoucherTab, label: 'Giảm Tiền Hàng' },
                { id: 'FREESHIP' as CheckoutVoucherTab, label: 'Freeship' },
              ].map((t) => {
                const active = tabFilter === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => onChangeTab(t.id)}
                    style={[
                      styles.tabPill,
                      {
                        backgroundColor: active ? colors.primary : colors.surface2,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.tabText, { color: active ? '#ffffff' : colors.textSecondary }]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {modalError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={15} color="#e11d48" />
                <Text style={styles.errorText}>{modalError}</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.emptySub, { color: colors.textMuted }]}>
                  Đang kiểm tra các mã khuyến mãi...
                </Text>
              </View>
            ) : eligibleVouchers.length === 0 && ineligibleVouchers.length === 0 ? (
              <View style={styles.centerBox}>
                <Ionicons name="ticket-outline" size={38} color={colors.textFaint} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Không có mã khuyến mãi phù hợp
                </Text>
              </View>
            ) : (
              <>
                {eligibleVouchers.length > 0 && (
                  <View style={styles.groupSection}>
                    <Text style={styles.groupTitleOk}>
                      CÓ THỂ ÁP DỤNG ({eligibleVouchers.length})
                    </Text>
                    {eligibleVouchers.map(({ voucher, estimatedDiscount, isBestChoice }) => {
                      const isSelected = appliedCode?.toUpperCase() === voucher.code.toUpperCase();
                      return (
                        <View
                          key={voucher.id}
                          style={[
                            styles.voucherCard,
                            {
                              backgroundColor: colors.surface2,
                              borderColor: isSelected ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <View style={styles.voucherTop}>
                            <View style={styles.voucherInfo}>
                              <View style={styles.badgeRow}>
                                <Text style={[styles.codeText, { color: colors.text }]}>{voucher.code}</Text>
                                {isBestChoice && (
                                  <View style={styles.bestBadge}>
                                    <Text style={styles.bestBadgeText}>Gợi ý tốt nhất</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={[styles.voucherName, { color: colors.text }]} numberOfLines={2}>
                                {voucher.name}
                              </Text>
                              {estimatedDiscount > 0 && (
                                <Text style={styles.discountHint}>
                                  Giảm ~{formatCurrency(estimatedDiscount)}
                                </Text>
                              )}
                              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                                HSD: {formatExpiry(voucher.expiresAt)}
                                {voucher.remainingUserUses != null && voucher.userUsageLimit != null
                                  ? ` • Còn ${voucher.remainingUserUses}/${voucher.userUsageLimit} lượt`
                                  : ''}
                              </Text>
                            </View>

                            <TouchableOpacity
                              disabled={applying}
                              onPress={() => onSelectVoucher(voucher.code)}
                              style={[
                                styles.btnSelect,
                                { backgroundColor: isSelected ? '#16a34a' : colors.primary },
                              ]}
                            >
                              <Text style={styles.btnSelectText}>
                                {isSelected ? 'Đang dùng' : 'Áp dụng'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {ineligibleVouchers.length > 0 && (
                  <View style={styles.groupSection}>
                    <Text style={[styles.groupTitleMuted, { color: colors.textMuted }]}>
                      CHƯA ĐỦ ĐIỀU KIỆN ({ineligibleVouchers.length})
                    </Text>
                    {ineligibleVouchers.map(({ voucher, reason, missingAmount, progressPercent }) => (
                      <View
                        key={voucher.id}
                        style={[
                          styles.voucherCard,
                          styles.disabledCard,
                          { backgroundColor: colors.surface2, borderColor: colors.border },
                        ]}
                      >
                        <View style={styles.voucherTop}>
                          <View style={styles.voucherInfo}>
                            <Text style={[styles.codeText, { color: colors.textMuted }]}>{voucher.code}</Text>
                            <Text style={[styles.voucherName, { color: colors.textSecondary }]} numberOfLines={2}>
                              {voucher.name}
                            </Text>
                          </View>
                          <View style={[styles.lockedBadge, { borderColor: colors.border }]}>
                            <Text style={[styles.lockedText, { color: colors.textMuted }]}>Chưa đủ ĐK</Text>
                          </View>
                        </View>

                        <Text style={styles.reasonText}>{reason}</Text>

                        {missingAmount > 0 && (
                          <View style={styles.progressWrap}>
                            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                            </View>
                            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                              Đạt {progressPercent}%
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '86%',
    borderTopLeftRadius: BorderRadius.xxl || 24,
    borderTopRightRadius: BorderRadius.xxl || 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  filterArea: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    paddingVertical: 8,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff1f2',
    padding: 8,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    fontSize: 11,
    color: '#be123c',
    flex: 1,
  },
  body: {
    padding: Spacing.md,
    gap: 16,
    paddingBottom: 32,
  },
  centerBox: {
    paddingVertical: 36,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
  },
  groupSection: {
    gap: 10,
  },
  groupTitleOk: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#16a34a',
  },
  groupTitleMuted: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  voucherCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 12,
    gap: 6,
  },
  disabledCard: {
    opacity: 0.72,
  },
  voucherTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  voucherInfo: {
    flex: 1,
    gap: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  codeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  bestBadge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  bestBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  voucherName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  discountHint: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#16a34a',
  },
  metaText: {
    fontSize: 10,
  },
  btnSelect: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  btnSelectText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  lockedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
  },
  reasonText: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: Typography.weights.semibold,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 999,
  },
  progressLabel: {
    fontSize: 10,
  },
});
