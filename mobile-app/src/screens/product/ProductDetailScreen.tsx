import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import { Header } from '../../components/common/Header';
import { useProductDetail } from '../../hooks/useProductDetail';
import { ProductGallery } from '../../components/product/ProductGallery';
import { VariantSelector } from '../../components/product/VariantSelector';
import { useTheme } from '../../context/ThemeContext';
import { SizeGuideModal } from '../../components/product/SizeGuideModal';
import { RestockModal } from '../../components/product/RestockModal';
import { ProductDescriptionSection } from '../../components/product/ProductDescriptionSection';
import { ProductReviewsSection } from '../../components/product/ProductReviewsSection';

export const ProductDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductDetail'>>();
  const { slug, initialProduct } = route.params;

  const {
    product,
    loading,
    images,
    activeImageIndex,
    setActiveImageIndex,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    availableColors,
    availableSizes,
    currentStock,
    currentPrice,
    currentOriginalPrice,
    isOutOfStock,
    reviews,
    reviewsSummary,
    loadingReviews,
    isSizeGuideVisible,
    setIsSizeGuideVisible,
    isRestockModalVisible,
    setIsRestockModalVisible,
    restockEmail,
    setRestockEmail,
    subscribingRestock,
    handleAddToCart,
    handleSubscribeRestock,
  } = useProductDetail(slug, initialProduct);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang nạp chi tiết sản phẩm...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.centerBox, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Không tìm thấy thông tin sản phẩm này.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <Header title={product.name} showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Gallery */}
        <ProductGallery
          images={images}
          activeImageIndex={activeImageIndex}
          onScrollIndexChange={setActiveImageIndex}
        />

        <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
          {/* Brand & Category */}
          <View style={styles.metaRow}>
            {product.brand && (
              <Text style={[styles.brandName, { color: colors.primary }]}>{product.brand.name.toUpperCase()}</Text>
            )}
            {product.category && (
              <Text style={[styles.categoryBadge, { backgroundColor: colors.slate100, color: colors.textMuted }]}>
                {product.category.name}
              </Text>
            )}
          </View>

          {/* Product Title */}
          <Text style={[styles.productTitle, { color: colors.text }]}>{product.name}</Text>

          {/* Price & Rating */}
          <View style={styles.priceRow}>
            <View style={styles.priceWrap}>
              <Text style={[styles.currentPrice, { color: colors.primary }]}>{formatCurrency(currentPrice)}</Text>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <Text style={[styles.originalPrice, { color: colors.textMuted }]}>{formatCurrency(currentOriginalPrice)}</Text>
              )}
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#eab308" />
              <Text style={styles.ratingText}>
                {product.averageRating ? product.averageRating.toFixed(1) : '5.0'}
              </Text>
              <Text style={styles.reviewsCount}>
                ({product.reviewsCount || 0} đánh giá)
              </Text>
            </View>
          </View>

          {/* Tồn kho thực tế */}
          <View style={styles.stockStatusRow}>
            <Ionicons
              name={isOutOfStock ? 'alert-circle' : 'checkmark-circle'}
              size={16}
              color={isOutOfStock ? Colors.error : '#15803d'}
            />
            <Text
              style={[
                styles.stockStatusText,
                isOutOfStock ? { color: Colors.error } : { color: '#15803d' },
              ]}
            >
              {isOutOfStock
                ? 'Hết hàng tại kho (Đăng ký nhận thông báo)'
                : `Còn hàng (${currentStock} sản phẩm sẵn có)`}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Variant Selector */}
          <VariantSelector
            availableColors={availableColors}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            availableSizes={availableSizes}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            onOpenSizeGuide={() => setIsSizeGuideVisible(true)}
          />

          <View style={styles.divider} />

          {/* Product Description (Tự động lọc mã HTML sang text định dạng sạch) */}
          <ProductDescriptionSection description={product.description} />

          <View style={styles.divider} />

          {/* Product Customer Reviews & Rating Breakdown (Đánh giá thực tế từ khách hàng) */}
          <ProductReviewsSection
            reviews={reviews}
            summary={reviewsSummary}
            loading={loadingReviews}
          />
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 24 : Spacing.md),
          },
        ]}
      >
        <View style={styles.bottomPriceBox}>
          <Text style={[styles.bottomPriceLabel, { color: colors.textMuted }]}>Tạm tính:</Text>
          <Text style={[styles.bottomPriceVal, { color: colors.primary }]}>{formatCurrency(currentPrice)}</Text>
        </View>

        {isOutOfStock ? (
          <TouchableOpacity
            style={styles.btnRestock}
            activeOpacity={0.85}
            onPress={() => setIsRestockModalVisible(true)}
          >
            <Ionicons name="notifications-outline" size={18} color={Colors.white} />
            <Text style={styles.btnAddToCartText}>Báo Khi Có Hàng</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.btnAddToCart}
            activeOpacity={0.85}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={20} color={Colors.white} />
            <Text style={styles.btnAddToCartText}>Thêm Vào Giỏ</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Size Guide Modal */}
      <SizeGuideModal
        visible={isSizeGuideVisible}
        onClose={() => setIsSizeGuideVisible(false)}
      />

      {/* Restock Notification Modal */}
      <RestockModal
        visible={isRestockModalVisible}
        email={restockEmail}
        onChangeEmail={setRestockEmail}
        submitting={subscribingRestock}
        onSubmit={handleSubscribeRestock}
        onClose={() => setIsRestockModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  infoContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    marginTop: -Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  brandName: {
    fontSize: 10,
    fontWeight: Typography.weights.black,
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
    color: Colors.slate500,
    backgroundColor: Colors.slate100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  productTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  currentPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  originalPrice: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate400,
    textDecorationLine: 'line-through',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fefce8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  ratingText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#854d0e',
  },
  reviewsCount: {
    fontSize: 10,
    color: Colors.slate500,
  },
  stockStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.slate50,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  stockStatusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.slate200,
    marginVertical: Spacing.sm,
  },
  descSection: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.black,
    color: Colors.slate400,
    letterSpacing: 0.8,
  },
  descText: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate600,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceBox: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 10,
    color: Colors.slate500,
  },
  bottomPriceVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  btnAddToCart: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  btnRestock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  btnAddToCartText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
