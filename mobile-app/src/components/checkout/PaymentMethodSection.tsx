import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface PaymentMethodSectionProps {
  paymentMethod: 'COD' | 'VNPAY';
  onSelectMethod: (method: 'COD' | 'VNPAY') => void;
}

export const PaymentMethodSection: React.FC<PaymentMethodSectionProps> = ({
  paymentMethod,
  onSelectMethod,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="wallet-outline" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Phương Thức Thanh Toán</Text>
      </View>

      {/* Option COD */}
      <TouchableOpacity
        style={[
          styles.option,
          { backgroundColor: colors.card, borderColor: colors.border },
          paymentMethod === 'COD' && { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
        ]}
        activeOpacity={0.8}
        onPress={() => onSelectMethod('COD')}
      >
        <View style={[styles.radio, { borderColor: colors.primary }]}>
          {paymentMethod === 'COD' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
        </View>
        <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
          <Ionicons name="cash-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.details}>
          <Text style={[styles.name, { color: colors.text }]}>Thanh toán khi nhận hàng (COD)</Text>
          <Text style={[styles.desc, { color: colors.textMuted }]}>Nhận hàng kiểm tra và thanh toán trực tiếp cho Shipper</Text>
        </View>
      </TouchableOpacity>

      {/* Option VNPAY */}
      <TouchableOpacity
        style={[
          styles.option,
          { backgroundColor: colors.card, borderColor: colors.border },
          paymentMethod === 'VNPAY' && { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
        ]}
        activeOpacity={0.8}
        onPress={() => onSelectMethod('VNPAY')}
      >
        <View style={[styles.radio, { borderColor: colors.primary }]}>
          {paymentMethod === 'VNPAY' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
        </View>
        <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
          <Ionicons name="qr-code-outline" size={22} color={colors.secondary} />
        </View>
        <View style={styles.details}>
          <Text style={[styles.name, { color: colors.text }]}>Cổng thanh toán VNPay</Text>
          <Text style={[styles.desc, { color: colors.textMuted }]}>Quét mã QR Pay, Thẻ ATM Nội địa & Quốc tế Visa/Master</Text>
        </View>
      </TouchableOpacity>
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
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate200,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  optionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  desc: {
    fontSize: 10,
    color: Colors.slate500,
    marginTop: 2,
  },
});
