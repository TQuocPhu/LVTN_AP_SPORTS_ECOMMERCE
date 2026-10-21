import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface RestockModalProps {
  visible: boolean;
  email: string;
  onChangeEmail: (text: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  visible,
  email,
  onChangeEmail,
  submitting,
  onSubmit,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.slate500} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Nhận Thông Báo Khi Có Hàng</Text>
          <Text style={styles.subtitle}>
            Kích cỡ này hiện đang tạm hết tại kho. Hãy để lại email để hệ thống tự động thông báo ngay khi AP Sports nhập thêm đợt hàng mới.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập email của bạn (ví dụ: customer@gmail.com)"
            placeholderTextColor={Colors.slate400}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={onChangeEmail}
          />

          <TouchableOpacity
            style={[styles.btnSubmit, submitting && styles.btnDisabled]}
            onPress={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.btnSubmitText}>Đăng Ký Nhận Thông Báo</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 380,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate600,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.slate300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.md,
  },
  btnSubmit: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  btnSubmitText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
