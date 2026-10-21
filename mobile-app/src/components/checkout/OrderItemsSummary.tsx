import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { CartItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTheme } from '../../context/ThemeContext';

interface OrderItemsSummaryProps {
  items: CartItem[];
}

export const OrderItemsSummary: React.FC<OrderItemsSummaryProps> = ({ items }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="bag-handle-outline" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Sản Phẩm Trong Đơn ({items.length})</Text>
      </View>

      {items.map((item) => (
        <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
          {item.productImage ? (
            <Image source={{ uri: item.productImage }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="football-outline" size={20} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
              {item.productName}
            </Text>
            {(item.variantColor || item.variantSize) && (
              <Text style={[styles.itemVariant, { color: colors.textMuted }]}>
                {[item.variantColor, item.variantSize].filter(Boolean).join(' / ')}
              </Text>
            )}
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
              <Text style={[styles.qty, { color: colors.textMuted }]}>x{item.quantity}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate100,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.slate100,
  },
  placeholder: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  itemName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.slate900,
  },
  itemVariant: {
    fontSize: 10,
    color: Colors.slate500,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  price: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  qty: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
  },
});
