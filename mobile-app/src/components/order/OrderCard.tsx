import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, Typography } from '../../config/theme';
import { Order } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTheme } from '../../context/ThemeContext';

interface OrderCardProps {
  order: Order;
  badge: { label: string; bg: string; text: string };
  onPress: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, badge, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.code, { color: colors.text }]}>#{order.orderCode}</Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Items Summary */}
      <View style={styles.body}>
        <Text style={[styles.countText, { color: colors.textMuted }]}>
          {order.items?.length || 1} sản phẩm • Ngày đặt:{' '}
          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
        </Text>
        {order.trackingCode && (
          <Text style={[styles.trackingText, { color: colors.secondary }]}>
            Mã vận đơn GHN: {order.trackingCode}
          </Text>
        )}
        {order.packVerified && (
          <View style={styles.verifiedTag}>
            <Ionicons name="checkmark-circle" size={14} color="#15803d" />
            <Text style={styles.verifiedText}>Đã quét kiểm đếm Barcode niêm phong</Text>
          </View>
        )}
      </View>

      {/* Footer Total */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Thành tiền:</Text>
        <Text style={[styles.totalPrice, { color: colors.primary }]}>
          {formatCurrency(order.finalAmount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  code: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.black,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  body: {
    gap: 4,
    marginBottom: Spacing.md,
  },
  countText: {
    fontSize: Typography.sizes.xs,
  },
  trackingText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: '#15803d',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.sizes.xs,
  },
  totalPrice: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
  },
});
