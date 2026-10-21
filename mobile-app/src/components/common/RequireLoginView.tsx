import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Typography } from '../../config/theme';

interface RequireLoginViewProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  subtitle?: string;
}

/**
 * Component hiển thị khi người dùng chưa đăng nhập nhưng truy cập
 * vào các trang yêu cầu xác thực (Giỏ hàng, Đơn hàng, Cá nhân...).
 * Tương thích 100% Dark/Light mode theo chuẩn AP Sports.
 */
export const RequireLoginView: React.FC<RequireLoginViewProps> = ({
  icon = 'lock-closed-outline',
  title = 'Yêu Cầu Đăng Nhập',
  description = 'Vui lòng đăng nhập tài khoản AP Sports để tiếp tục sử dụng tính năng này.',
  subtitle = 'Nhận trọn bộ đặc quyền thành viên và ưu đãi thể thao độc quyền!',
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}>
        <Ionicons name={icon} size={48} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>

      <View style={[styles.badgeContainer, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
        <Ionicons name="sparkles" size={16} color={colors.primary} />
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>

      {/* Button Đăng Nhập */}
      <TouchableOpacity
        style={[styles.btnLogin, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Login')}
      >
        <Ionicons name="log-in-outline" size={20} color="#ffffff" />
        <Text style={styles.btnLoginText}>Đăng Nhập Ngay</Text>
      </TouchableOpacity>

      {/* Button Đăng Ký Tài Khoản Mới */}
      <TouchableOpacity
        style={[styles.btnRegister, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={[styles.btnRegisterText, { color: colors.text }]}>Tạo Tài Khoản Mới</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  btnLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.xs,
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    marginBottom: Spacing.sm,
  },
  btnLoginText: {
    color: '#ffffff',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  btnRegister: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  btnRegisterText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
