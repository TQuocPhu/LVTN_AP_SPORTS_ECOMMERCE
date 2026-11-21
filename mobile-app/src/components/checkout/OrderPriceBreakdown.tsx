import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTheme } from '../../context/ThemeContext';
import { VoucherApplyResult } from '../../types';

interface OrderPriceBreakdownProps {
  itemCount: number;
  totalAmount: number;
  shippingFee: number;
  discountAmount?: number;
  finalTotal: number;
  couponCode: string;
  onChangeCouponCode: (code: string) => void;
  appliedVoucher?: VoucherApplyResult | null;
  applyingVoucher?: boolean;
  voucherError?: string | null;
  onApplyVoucher?: () => void;
  onRemoveVoucher?: () => void;
  onOpenVoucherModal?: () => void;
  note: string;
  onChangeNote: (text: string) => void;
}

export const OrderPriceBreakdown: React.FC<OrderPriceBreakdownProps> = ({
  itemCount,
  totalAmount,
  shippingFee,
  discountAmount = 0,
  finalTotal,
  couponCode,
  onChangeCouponCode,
  appliedVoucher,
  applyingVoucher = false,
  voucherError,
  onApplyVoucher,
  onRemoveVoucher,
  onOpenVoucherModal,
  note,
  onChangeNote,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Voucher & Ghi chú */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.voucherHeaderRow}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
            Mã giảm giá (Voucher):
          </Text>
          {onOpenVoucherModal && (
            <TouchableOpacity onPress={onOpenVoucherModal}>
              <Text style={[styles.chooseVoucherLink, { color: colors.primary }]}>
                Chọn Voucher
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {appliedVoucher ? (
          <View style={[styles.appliedBox, { borderColor: colors.primary, backgroundColor: colors.surface2 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.appliedCode, { color: colors.primary }]}>
                {appliedVoucher.couponCode || appliedVoucher.voucher?.code || couponCode} • Giảm{' '}
                {formatCurrency(appliedVoucher.discountAmount)}
              </Text>
              <Text style={[styles.appliedDesc, { color: colors.textMuted }]} numberOfLines={1}>
                {appliedVoucher.couponName || appliedVoucher.message || 'Đã áp dụng thành công'}
              </Text>
            </View>
            {onRemoveVoucher && (
              <TouchableOpacity onPress={onRemoveVoucher} style={styles.btnRemoveCoupon}>
                <Text style={styles.btnRemoveCouponText}>Gỡ</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.couponRow}>
            <TextInput
              style={[
                styles.couponInput,
                { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="Nhập mã ưu đãi (ví dụ: APSPORTS10)"
              placeholderTextColor={colors.textFaint}
              value={couponCode}
              onChangeText={(t) => onChangeCouponCode(t.toUpperCase())}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.btnApplyCoupon, { backgroundColor: colors.primary }]}
              onPress={onApplyVoucher}
              disabled={applyingVoucher || !couponCode.trim()}
            >
              {applyingVoucher ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.btnApplyCouponText}>Áp Dụng</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {voucherError && !appliedVoucher && (
          <Text style={styles.voucherErrorText}>{voucherError}</Text>
        )}

        <Text style={[styles.inputLabel, { marginTop: Spacing.md, color: colors.textSecondary }]}>Ghi chú đơn hàng:</Text>
        <TextInput
          style={[
            styles.noteInput,
            { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Lời dặn shipper (ví dụ: gọi trước 15 phút, giao giờ hành chính)..."
          placeholderTextColor={colors.textFaint}
          value={note}
          onChangeText={onChangeNote}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Chi tiết thanh toán */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Chi Tiết Thanh Toán</Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Tiền hàng ({itemCount} món):</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(totalAmount)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Phí giao hàng:</Text>
          <Text style={[styles.summaryValue, shippingFee === 0 ? { color: '#16a34a' } : { color: colors.text }]}>
            {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
          </Text>
        </View>
        {shippingFee === 0 && (
          <Text style={styles.freeShipNote}>🎉 Đơn hàng trên 500k được miễn phí vận chuyển!</Text>
        )}

        {discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Giảm giá Voucher:</Text>
            <Text style={[styles.summaryValue, { color: '#ea580c' }]}>
              -{formatCurrency(discountAmount)}
            </Text>
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.summaryRow}>
          <Text style={[styles.totalLabelFinal, { color: colors.text }]}>Tổng thanh toán:</Text>
          <Text style={[styles.totalValueFinal, { color: colors.primary }]}>{formatCurrency(finalTotal)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate700,
    marginBottom: 6,
  },
  voucherHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chooseVoucherLink: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  appliedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: 8,
  },
  appliedCode: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  appliedDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  btnRemoveCoupon: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#fee2e2',
  },
  btnRemoveCouponText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#b91c1c',
  },
  voucherErrorText: {
    fontSize: 11,
    color: '#e11d48',
    marginTop: 6,
  },
  couponRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  couponInput: {
    flex: 1,
    backgroundColor: Colors.slate50,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: Typography.sizes.xs,
  },
  btnApplyCoupon: {
    backgroundColor: Colors.slate800,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnApplyCouponText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  noteInput: {
    backgroundColor: Colors.slate50,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: Typography.sizes.xs,
    textAlignVertical: 'top',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate600,
  },
  summaryValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.slate900,
  },
  freeShipNote: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.slate200,
    marginVertical: Spacing.sm,
  },
  totalLabelFinal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  totalValueFinal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
});
