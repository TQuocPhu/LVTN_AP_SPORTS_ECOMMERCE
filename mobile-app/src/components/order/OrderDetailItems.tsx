import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { OrderItem } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface OrderDetailItemsProps {
  items: OrderItem[];
  canReview: boolean;
  onReviewItem: (item: OrderItem) => void;
}

export const OrderDetailItems: React.FC<OrderDetailItemsProps> = ({
  items,
  canReview,
  onReviewItem,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>DANH SÁCH MẶT HÀNG ({items.length})</Text>
      {items.map((item, idx) => (
        <View key={idx} style={styles.itemCard}>
          <View style={styles.itemRow}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.img} resizeMode="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="football-outline" size={20} color={Colors.slate400} />
              </View>
            )}
            <View style={styles.details}>
              <Text style={styles.name} numberOfLines={2}>
                {item.productName}
              </Text>
              {item.attributes ? (
                <Text style={styles.sku}>{item.attributes}</Text>
              ) : item.sku ? (
                <Text style={styles.sku}>SKU: {item.sku}</Text>
              ) : null}
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                <Text style={styles.qty}>x{item.quantity}</Text>
              </View>
            </View>
          </View>

          {/* Nút chụp ảnh thực tế & Đánh giá */}
          {canReview && (
            <View style={styles.reviewRow}>
              {item.isReviewed ? (
                <View style={styles.reviewedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#15803d" />
                  <Text style={styles.reviewedBadgeText}>Đã gửi đánh giá</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.btnReview}
                  onPress={() => onReviewItem(item)}
                >
                  <Ionicons name="camera-outline" size={16} color={Colors.primary} />
                  <Text style={styles.btnReviewText}>Chụp Ảnh & Đánh Giá</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  title: {
    fontSize: 11,
    fontWeight: Typography.weights.black,
    color: Colors.slate400,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  itemCard: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate100,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  img: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
  },
  placeholder: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  sku: {
    fontSize: 10,
    color: Colors.slate400,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  qty: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate600,
    fontWeight: Typography.weights.bold,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
  },
  btnReview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnReviewText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  reviewedBadgeText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: Typography.weights.semibold,
  },
});
