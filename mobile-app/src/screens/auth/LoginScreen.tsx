import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { useLoginForm } from '../../hooks/useLoginForm';
import { LoginFormFields } from '../../components/auth/LoginFormFields';
import { GoogleOAuthModal } from '../../components/auth/GoogleOAuthModal';
import { useTheme } from '../../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

/**
 * Màn hình Đăng Nhập Khách Hàng trên Mobile (LoginScreen).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Pure UI Screen: Không sử dụng useState hay useEffect trong Component/Screen.
 * - Toàn bộ trạng thái đăng nhập thường và đăng nhập Google OAuth2 được quản lý bởi `useLoginForm()`.
 */
export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    isSubmitting,
    isGoogleLoading,
    isGoogleModalVisible,
    googleAuthUrl,
    handleQuickLogin,
    handleLogin,
    handleOpenGoogleLogin,
    handleCloseGoogleModal,
    handleInterceptGoogleRedirect,
  } = useLoginForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Close Modal Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Brand Header */}
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>AP</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Đăng Nhập Khách Hàng</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Trải nghiệm mua sắm thiết bị thể thao đỉnh cao và nhận ưu đãi tích điểm thành viên
          </Text>
        </View>

        {/* Login Form Fields */}
        <LoginFormFields
          email={email}
          onChangeEmail={setEmail}
          password={password}
          onChangePassword={setPassword}
          showPassword={showPassword}
          onToggleShowPassword={toggleShowPassword}
          onQuickLogin={handleQuickLogin}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.btnLogin,
            { backgroundColor: colors.primary },
            (isSubmitting || isGoogleLoading) && styles.btnLoginDisabled,
          ]}
          onPress={handleLogin}
          disabled={isSubmitting || isGoogleLoading}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.btnLoginText}>Đăng Nhập</Text>
          )}
        </TouchableOpacity>

        {/* Divider: Hoặc đăng nhập với */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>HOẶC ĐĂNG NHẬP VỚI</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[
            styles.btnGoogle,
            { backgroundColor: colors.card, borderColor: colors.border },
            (isSubmitting || isGoogleLoading) && styles.btnLoginDisabled,
          ]}
          onPress={handleOpenGoogleLogin}
          disabled={isSubmitting || isGoogleLoading}
          activeOpacity={0.85}
        >
          {isGoogleLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="logo-google" size={18} color="#EA4335" />
              <Text style={[styles.btnGoogleText, { color: colors.text }]}>
                Đăng nhập bằng Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Register prompt */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal WebView OAuth2 cho Đăng nhập bằng Google */}
      <GoogleOAuthModal
        visible={isGoogleModalVisible}
        authUrl={googleAuthUrl}
        onClose={handleCloseGoogleModal}
        onInterceptRedirect={handleInterceptGoogleRedirect}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: Spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: Colors.white,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  btnLogin: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  btnLoginDisabled: {
    opacity: 0.7,
  },
  btnLoginText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.slate200,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.slate400,
    letterSpacing: 0.5,
  },
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 13,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate200,
    backgroundColor: Colors.white,
  },
  btnGoogleText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
  },
  registerLink: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
});
