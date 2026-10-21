import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { formatCurrency } from '../../utils/formatCurrency';
import { Header } from '../../components/common/Header';
import { useCheckout } from '../../hooks/useCheckout';
import { AddressSection } from '../../components/checkout/AddressSection';
import { OrderItemsSummary } from '../../components/checkout/OrderItemsSummary';
import { PaymentMethodSection } from '../../components/checkout/PaymentMethodSection';
import { OrderPriceBreakdown } from '../../components/checkout/OrderPriceBreakdown';
import { NewAddressModal } from '../../components/checkout/NewAddressModal';
import { useTheme } from '../../context/ThemeContext';

export const CheckoutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();

  const {
    items,
    totalAmount,
    shippingFee,
    finalTotal,
    selectedAddress,
    paymentMethod,
    setPaymentMethod,
    couponCode,
    setCouponCode,
    note,
    setNote,
    isSubmitting,
    loadingAddress,
    isAddressModalVisible,
    setIsAddressModalVisible,
    newFullName,
    setNewFullName,
    newPhone,
    setNewPhone,
    newAddressText,
    setNewAddressText,
    newCity,
    setNewCity,
    isAddingAddress,
    handleCreateNewAddress,
    handleConfirmOrder,
  } = useCheckout();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <Header title="Xác Nhận Đặt Hàng" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Địa chỉ giao hàng */}
        <AddressSection
          selectedAddress={selectedAddress}
          loading={loadingAddress}
          onOpenAddressModal={() => setIsAddressModalVisible(true)}
        />

        {/* Sản phẩm trong đơn */}
        <OrderItemsSummary items={items} />

        {/* Phương thức thanh toán */}
        <PaymentMethodSection
          paymentMethod={paymentMethod}
          onSelectMethod={setPaymentMethod}
        />

        {/* Mã giảm giá Voucher & Chi tiết thanh toán */}
        <OrderPriceBreakdown
          itemCount={items.length}
          totalAmount={totalAmount}
          shippingFee={shippingFee}
          finalTotal={finalTotal}
          couponCode={couponCode}
          onChangeCouponCode={setCouponCode}
          note={note}
          onChangeNote={setNote}
        />
      </ScrollView>

      {/* Thanh footer nút xác nhận */}
      <View
        style={[
          styles.footerBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 24 : Spacing.md),
          },
        ]}
      >
        <View style={styles.footerTotalBox}>
          <Text style={[styles.footerTotalLabel, { color: colors.textMuted }]}>Tổng cộng:</Text>
          <Text style={[styles.footerTotalValue, { color: colors.primary }]}>{formatCurrency(finalTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.btnConfirm, { backgroundColor: colors.primary }, isSubmitting && styles.btnDisabled]}
          activeOpacity={0.85}
          onPress={handleConfirmOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.btnConfirmText}>Đặt Hàng</Text>
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Thêm Địa Chỉ */}
      <NewAddressModal
        visible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        fullName={newFullName}
        onChangeFullName={setNewFullName}
        phone={newPhone}
        onChangePhone={setNewPhone}
        addressText={newAddressText}
        onChangeAddressText={setNewAddressText}
        city={newCity}
        onChangeCity={setNewCity}
        isAdding={isAddingAddress}
        onSubmit={handleCreateNewAddress}
      />
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
  footerBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTotalBox: {
    flex: 1,
  },
  footerTotalLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
  },
  footerTotalValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  btnConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  btnConfirmText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
