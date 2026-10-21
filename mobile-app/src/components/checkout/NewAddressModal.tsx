import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface NewAddressModalProps {
  visible: boolean;
  onClose: () => void;
  fullName: string;
  onChangeFullName: (text: string) => void;
  phone: string;
  onChangePhone: (text: string) => void;
  addressText: string;
  onChangeAddressText: (text: string) => void;
  city: string;
  onChangeCity: (text: string) => void;
  isAdding: boolean;
  onSubmit: () => void;
}

export const NewAddressModal: React.FC<NewAddressModalProps> = ({
  visible,
  onClose,
  fullName,
  onChangeFullName,
  phone,
  onChangePhone,
  addressText,
  onChangeAddressText,
  city,
  onChangeCity,
  isAdding,
  onSubmit,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm Địa Chỉ Giao Hàng</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.slate600} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Họ và tên người nhận:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChangeText={onChangeFullName}
            />

            <Text style={styles.fieldLabel}>Số điện thoại:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0912345678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={onChangePhone}
            />

            <Text style={styles.fieldLabel}>Địa chỉ chi tiết (Số nhà, tên đường, phường):</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              placeholder="123 Lê Duẩn, Phường Bến Nghé, Quận 1"
              multiline
              value={addressText}
              onChangeText={onChangeAddressText}
            />

            <Text style={styles.fieldLabel}>Tỉnh / Thành phố:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Hồ Chí Minh"
              value={city}
              onChangeText={onChangeCity}
            />

            <TouchableOpacity
              style={[styles.btnSaveAddress, isAdding && styles.btnDisabled]}
              onPress={onSubmit}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.btnSaveAddressText}>Lưu & Chọn Địa Chỉ Này</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  fieldLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate700,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.slate300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: Typography.sizes.xs,
  },
  btnSaveAddress: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  btnSaveAddressText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
