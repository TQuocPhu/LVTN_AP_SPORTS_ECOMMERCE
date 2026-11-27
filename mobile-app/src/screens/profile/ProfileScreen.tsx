import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { appAlert } from '../../context/AlertContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HomeHeader } from '../../components/home/HomeHeader';

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const handleLogout = () => {
    appAlert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <HomeHeader />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card Header */}
        <View style={[styles.userHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {isAuthenticated && user ? (
            <View style={styles.userProfileRow}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}>
                  <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>Thành viên AP Sports</Text>
                  </View>
                  {(user.googleAccount || user.googleId) && (
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
                      ]}
                    >
                      <Text style={[styles.roleText, { color: '#1d4ed8' }]}>
                        Đã liên kết Google
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.guestBox}>
              <View style={[styles.guestIconCircle, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
              <View style={styles.guestInfo}>
                <Text style={[styles.guestTitle, { color: colors.text }]}>Chào mừng bạn đến với AP Sports</Text>
                <Text style={[styles.guestSubtitle, { color: colors.textMuted }]}>Đăng nhập để nhận ưu đãi thành viên</Text>
              </View>
              <TouchableOpacity
                style={[styles.btnLogin, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.btnLoginText}>Đăng Nhập</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Menu Section 1: Đơn Hàng & Mua Sắm */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>TIỆN ÍCH MUA SẮM</Text>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() =>
              isAuthenticated
                ? navigation.navigate('ProfileManagement')
                : navigation.navigate('Login')
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.18)' : '#dcfce7' }]}>
              <Ionicons name="person-circle-outline" size={20} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: colors.text }]}>Quản lý thông tin cá nhân</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                Hồ sơ, ảnh đại diện, sổ địa chỉ GHN & đổi mật khẩu
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MainTabs', { screen: 'OrdersTab' })}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#ffedd5' }]}>
              <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Đơn hàng của tôi</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('MainTabs', { screen: 'CartTab' })}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="cart-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Giỏ hàng đang chọn</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Menu Section 2: Hỗ Trợ & Cài Đặt */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>CÀI ĐẶT & HỖ TRỢ</Text>

          {/* Chế độ Dark / Light Mode */}
          <View style={[styles.menuItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: isDarkMode ? '#334155' : '#fef3c7' }]}>
              <Ionicons
                name={isDarkMode ? 'moon' : 'sunny'}
                size={20}
                color={isDarkMode ? '#38bdf8' : '#d97706'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: colors.text }]}>Giao diện Tối (Dark Mode)</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                {isDarkMode ? 'Đang bật nền tối thể thao' : 'Đang bật nền sáng'}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={{ padding: 4 }}>
              <Ionicons
                name={isDarkMode ? 'toggle' : 'toggle-outline'}
                size={34}
                color={isDarkMode ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Live Chat & AI Bot */}
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SupportChat')}
          >
            <View style={[styles.menuIcon, { backgroundColor: isDarkMode ? 'rgba(249, 115, 22, 0.18)' : '#ffedd5' }]}>
              <Ionicons name="chatbubbles" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: colors.text }]}>Tư vấn trực tiếp & Trợ lý AI</Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                Nhắn tin với nhân viên CSKH hoặc AI Bot
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() =>
              appAlert(
                'Về AP Sports',
                'Hệ thống thương mại điện tử chuyên cung cấp dụng cụ, giày đá bóng, trang phục thể thao chính hãng hàng đầu Việt Nam.'
              )
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Về thương hiệu AP Sports</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={() =>
              appAlert(
                'Chính sách đổi trả',
                'Hỗ trợ đổi size và đổi trả hàng trong vòng 30 ngày kể từ ngày nhận hàng với sản phẩm còn nguyên tem mác.'
              )
            }
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Chính sách bảo hành & đổi trả</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>


        {/* Logout Button */}
        {isAuthenticated && (
          <View style={styles.logoutWrapper}>
            <TouchableOpacity
              style={[
                styles.btnLogout,
                {
                  backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                  borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.45)' : '#fca5a5',
                },
              ]}
              activeOpacity={0.85}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={[styles.btnLogoutText, { color: colors.error }]}>Đăng Xuất</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.versionText, { color: colors.textMuted }]}>AP Sports Mobile v1.0.0 (Build 2026)</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  userHeader: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate200,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarInitial: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.black,
    color: Colors.primaryDark,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: Colors.slate900,
  },
  userEmail: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#ecfdf5',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  roleText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  guestBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestInfo: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  guestTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  guestSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate500,
    marginTop: 2,
  },
  btnLogin: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  btnLoginText: {
    color: Colors.white,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.slate200,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: Typography.weights.black,
    color: Colors.slate400,
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate100,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.slate800,
  },
  logoutWrapper: {
    padding: Spacing.lg,
  },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  btnLogoutText: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  versionText: {
    textAlign: 'center',
    color: Colors.slate400,
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.xxl,
  },
});
