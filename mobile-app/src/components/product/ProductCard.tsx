import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { Spacing, BorderRadius, Typography } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTheme } from '../../context/ThemeContext';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.lg * 2 - Spacing.md) / 2;

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { colors } = useTheme();

  const discountPercent =
    product.originalPrice && product.originalPrice > product.basePrice
      ? Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100)
      : null;

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
      {/* Thumbnail with Badge */}
      <View style={[styles.imageContainer, { backgroundColor: colors.slate100 }]}>
        {product.thumbnail ? (
          <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="football-outline" size={36} color={colors.textMuted} />
          </View>
        )}

        {discountPercent ? (
          <View style={[styles.badgeDiscount, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>-{discountPercent}%</Text>
          </View>
        ) : null}
      </View>

      {/* Info Body */}
      <View style={styles.info}>
        {product.brand?.name && (
          <Text style={[styles.brand, { color: colors.primary }]} numberOfLines={1}>
            {product.brand.name}
          </Text>
        )}
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating and Sold */}
        <View style={styles.metaRow}>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={[styles.ratingText, { color: colors.textMuted }]}>
              {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
            </Text>
          </View>
          {product.totalSold ? (
            <Text style={[styles.soldText, { color: colors.textMuted }]}>
              Đã bán {product.totalSold}
            </Text>
          ) : null}
        </View>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>
            {formatCurrency(product.basePrice)}
          </Text>
          {product.originalPrice && product.originalPrice > product.basePrice ? (
            <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
              {formatCurrency(product.originalPrice)}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.05,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDiscount: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.black,
  },
  info: {
    padding: Spacing.md,
  },
  brand: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    lineHeight: 18,
    minHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  soldText: {
    fontSize: Typography.sizes.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
    marginTop: 2,
  },
  price: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
  },
  originalPrice: {
    fontSize: Typography.sizes.xs,
    textDecorationLine: 'line-through',
  },
});
