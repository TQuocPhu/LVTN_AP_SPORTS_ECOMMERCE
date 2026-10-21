import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import { Header } from '../../components/common/Header';
import { useOrderDetail } from '../../hooks/useOrderDetail';
import { OrderDetailItems } from '../../components/order/OrderDetailItems';
import { DeliveryTrackingMap } from '../../components/order/DeliveryTrackingMap';
import { useTheme } from '../../context/ThemeContext';

export const OrderDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();
  const orderIdentifier = route.params.orderCode || String(route.params.orderId);
  const { colors } = useTheme();

  const {
    order,
    loading,
    actionLoading,
    canReview,
    canComplete,
    canCancel,
    handleCompleteOrder,
    handleCancelOrder,
  } = useOrderDetail(orderIdentifier);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <Header
        title={`Đơn Hàng #${order?.orderCode || orderIdentifier}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Đang tải chi tiết đơn hàng...</Text>
        </View>
      ) : !order ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>Không tìm thấy thông tin đơn hàng</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Status highlight */}
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statusRow}>
              <View style={[styles.statusIconBox, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="cube" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusCode, { color: colors.text }]}>#{order.orderCode}</Text>
                <Text style={[styles.statusLabel, { color: colors.textMuted }]}>Trạng thái: {order.status.toUpperCase()}</Text>
              </View>
            </View>
            {order.packVerified && (
              <View style={styles.verifiedTag}>
                <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                <Text style={styles.verifiedText}>Kiện hàng đã kiểm đếm Barcode niêm phong an toàn</Text>
              </View>
            )}
          </View>

          {/* Bản đồ giao hàng trực quan với xe đang chạy */}
          <DeliveryTrackingMap
            orderStatus={order.status}
            trackingCode={order.trackingCode}
            destAddress={order.shippingAddress}
            height={280}
          />

          {/* Delivery Info */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ĐỊA CHỈ NHẬN HÀNG</Text>

            <Text style={[styles.customerName, { color: colors.text }]}>{order.customerName || 'Khách hàng AP Sports'}</Text>
            {order.customerPhone && <Text style={[styles.customerPhone, { color: colors.textMuted }]}>{order.customerPhone}</Text>}
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>{order.shippingAddress || 'Địa chỉ tiêu chuẩn'}</Text>
            {order.trackingCode && (
              <View style={[styles.trackingBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
                <Text style={[styles.trackingLabel, { color: colors.textMuted }]}>Mã vận đơn GHN:</Text>
                <Text style={[styles.trackingCode, { color: colors.primary }]}>{order.trackingCode}</Text>
              </View>
            )}
          </View>

          {/* Product Items */}
          <OrderDetailItems
            items={order.items || []}
            canReview={canReview}
            onReviewItem={(item) =>
              navigation.navigate('CreateReview', {
                productId: item.productId,
                orderItemId: item.id,
                productName: item.productName,
                productImage: item.image,
                variantSummary: item.attributes || item.sku,
              })
            }
          />

          {/* Payment Summary */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CHI TIẾT THANH TOÁN</Text>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: colors.textMuted }]}>Phương thức thanh toán:</Text>
              <Text style={[styles.feeVal, { color: colors.text }]}>{order.paymentMethod || 'COD'}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: colors.textMuted }]}>Tiền hàng:</Text>
              <Text style={[styles.feeVal, { color: colors.text }]}>{formatCurrency(order.totalAmount)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: colors.textMuted }]}>Phí giao hàng:</Text>
              <Text style={[styles.feeVal, { color: colors.text }]}>{formatCurrency(order.shippingFee)}</Text>
            </View>
            {order.discountAmount ? (
              <View style={styles.feeRow}>
                <Text style={[styles.feeLabel, { color: colors.textMuted }]}>Giảm giá Voucher:</Text>
                <Text style={[styles.feeVal, { color: colors.error }]}>
                  -{formatCurrency(order.discountAmount)}
                </Text>
              </View>
            ) : null}
            <View style={[styles.feeRow, styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Tổng thanh toán:</Text>
              <Text style={[styles.totalVal, { color: colors.primary }]}>{formatCurrency(order.finalAmount)}</Text>
            </View>
          </View>

          {/* Nút hành động đơn hàng */}
          {canComplete && (
            <TouchableOpacity
              style={styles.btnComplete}
              onPress={handleCompleteOrder}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color={Colors.white} />
                  <Text style={styles.btnCompleteText}>Đã Nhận Được Hàng & Hoàn Tất</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={handleCancelOrder}
              disabled={actionLoading}
            >
              <Text style={styles.btnCancelText}>Hủy Đơn Hàng Này</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.slate500,
  },
  errorText: {
    color: Colors.error,
    fontWeight: Typography.weights.bold,
  },
  statusCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCode: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
  },
  statusLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    marginTop: 2,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    padding: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#15803d',
  },
  sectionCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.black,
    color: Colors.slate400,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  customerName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  customerPhone: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
    marginTop: 2,
  },
  addressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate700,
    marginTop: 4,
    lineHeight: 18,
  },
  trackingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#e0f2fe',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  trackingLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.secondary,
    fontWeight: Typography.weights.bold,
  },
  trackingCode: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.black,
    color: Colors.secondary,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  feeLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
  },
  feeVal: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate800,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
  },
  totalVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  btnComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  btnCompleteText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  btnCancel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate300,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  btnCancelText: {
    color: Colors.slate600,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
