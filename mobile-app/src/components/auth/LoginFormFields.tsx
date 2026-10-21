import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface LoginFormFieldsProps {
  email: string;
  onChangeEmail: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  onQuickLogin: () => void;
}

export const LoginFormFields: React.FC<LoginFormFieldsProps> = ({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  showPassword,
  onToggleShowPassword,
  onQuickLogin,
}) => {
  return (
    <View style={styles.container}>
      {/* Nút thử nghiệm nhanh */}
      <TouchableOpacity style={styles.btnQuickFill} activeOpacity={0.8} onPress={onQuickLogin}>
        <Ionicons name="flash-outline" size={16} color={Colors.primary} />
        <Text style={styles.btnQuickFillText}>
          Tự động điền tài khoản mẫu (customer@apsports.com)
        </Text>
      </TouchableOpacity>

      {/* Email Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email đăng nhập</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={20} color={Colors.slate400} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            placeholderTextColor={Colors.slate400}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={onChangeEmail}
          />
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.inputWrap}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={Colors.slate400}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={Colors.slate400}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={onChangePassword}
          />
          <TouchableOpacity onPress={onToggleShowPassword} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.slate400}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  btnQuickFill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnQuickFillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate700,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate300,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: Typography.sizes.xs,
    color: Colors.slate900,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
});
