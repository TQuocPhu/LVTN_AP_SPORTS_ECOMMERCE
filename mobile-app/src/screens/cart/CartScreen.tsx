import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RequireLoginView } from '../../components/common/RequireLoginView';

export const CartScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, totalAmount, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { colors } = useTheme();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để tiến hành đặt hàng và nhận ưu đãi thành viên.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    navigation.navigate('Checkout');
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Giỏ Hàng Của Bạn</Text>
        </View>
        <RequireLoginView
          icon="cart-outline"
          title="Giỏ Hàng Mua Sắm"
          description="Vui lòng đăng nhập tài khoản để lưu trữ giỏ hàng, đồng bộ thiết bị thể thao yêu thích và nhận ưu đãi độc quyền dành cho thành viên AP Sports."
          subtitle="Đăng nhập để nhận voucher giảm giá và tích lũy điểm thưởng!"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Giỏ Hàng Của Bạn</Text>
        <Text style={[styles.headerCount, { color: colors.textMuted }]}>({items.length} mặt hàng)</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.primaryMuted }]}>
            <Ionicons name="cart-outline" size={60} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Giỏ hàng đang trống</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Hãy khám phá các trang thiết bị thể thao đỉnh cao và thêm vào giỏ ngay!
          </Text>
          <TouchableOpacity
            style={[styles.btnExplore, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CatalogTab' })}
          >
            <Text style={styles.btnExploreText}>Khám Phá Sản Phẩm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Thumbnail */}
                {item.productImage ? (
                  <Image source={{ uri: item.productImage }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.placeholderImg, { backgroundColor: colors.surface2 }]}>
                    <Ionicons name="football-outline" size={24} color={colors.textMuted} />
                  </View>
                )}

                {/* Details */}
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                    {item.productName}
                  </Text>

                  {/* Variant Tags */}
                  {(item.variantColor || item.variantSize) && (
                    <View style={styles.variantRow}>
                      {item.variantColor ? (
                        <Text style={[styles.variantBadge, { backgroundColor: colors.surface2, color: colors.textSecondary }]}>
                          Màu: {item.variantColor}
                        </Text>
                      ) : null}
                      {item.variantSize ? (
                        <Text style={[styles.variantBadge, { backgroundColor: colors.surface2, color: colors.textSecondary }]}>
                          Size: {item.variantSize}
                        </Text>
                      ) : null}
                    </View>
                  )}

                  <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>

                  {/* Stepper & Trash */}
                  <View style={styles.actionRow}>
                    <View style={[styles.stepper, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={16} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={[styles.stepQty, { color: colors.text }]}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.stepBtn}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Bottom Checkout Bar */}
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
            <View style={styles.totalBox}>
              <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Tổng thanh toán:</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency(totalAmount)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.btnCheckout, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={handleCheckout}
            >
              <Text style={styles.btnCheckoutText}>Đặt Hàng Ngay</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate200,
    gap: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
  },
  headerCount: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
    fontWeight: Typography.weights.semibold,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.slate200,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImage: {
    width: 86,
    height: 86,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.slate100,
  },
  placeholderImg: {
    width: 86,
    height: 86,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  variantRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: 4,
  },
  variantBadge: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.slate600,
    backgroundColor: Colors.slate100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  itemPrice: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.slate100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepQty: {
    paddingHorizontal: 8,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  deleteBtn: {
    padding: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.slate500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  btnExplore: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  btnExploreText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  bottomBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalBox: {
    flex: 1,
  },
  totalLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
  },
  totalValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  btnCheckout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  btnCheckoutText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
