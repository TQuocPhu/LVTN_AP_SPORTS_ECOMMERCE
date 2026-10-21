import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { ShippingAddress } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AddressSectionProps {
  selectedAddress: ShippingAddress | null;
  loading: boolean;
  onOpenAddressModal: () => void;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  selectedAddress,
  loading,
  onOpenAddressModal,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="location-outline" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Địa Chỉ Nhận Hàng</Text>
        </View>
        <TouchableOpacity onPress={onOpenAddressModal} style={styles.changeBtn}>
          <Text style={[styles.changeBtnText, { color: colors.primary }]}>
            {selectedAddress ? 'Thay đổi' : '+ Thêm mới'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: Spacing.md }} />
      ) : selectedAddress ? (
        <View style={[styles.addressBox, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
          <View style={styles.addressRow}>
            <Text style={[styles.addressName, { color: colors.text }]}>{selectedAddress.fullName}</Text>
            <Text style={[styles.addressPhone, { color: colors.textMuted }]}>{selectedAddress.phone}</Text>
          </View>
          <Text style={[styles.addressText, { color: colors.textSecondary }]}>
            {selectedAddress.address}, {selectedAddress.city}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.noAddressBox, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}
          onPress={onOpenAddressModal}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.noAddressText, { color: colors.primary }]}>Chưa có địa chỉ. Bấm để thêm địa chỉ nhận hàng</Text>
        </TouchableOpacity>
      )}
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
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  changeBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  changeBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  addressBox: {
    backgroundColor: Colors.slate50,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  addressName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  addressPhone: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate600,
  },
  addressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate700,
    lineHeight: 18,
  },
  noAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryMuted,
  },
  noAddressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
});
