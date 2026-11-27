import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Spacing, Typography } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';

interface HomeHeaderProps {
  cartItemCount?: number;
  onCartPress?: () => void;
  onChatPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  cartItemCount,
  onCartPress,
  onChatPress,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { totalItems } = useCart();

  const resolvedCartCount = cartItemCount ?? totalItems;
  const handleCartPress =
    onCartPress ?? (() => navigation.navigate('MainTabs', { screen: 'CartTab' }));
  const handleChatPress = onChatPress ?? (() => navigation.navigate('SupportChat'));

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.brandRow}>
        <View style={[styles.logoBadge, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: colors.border }]}>
          <Image
            source={require('../../../assets/ap-sports_logo_no-back.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>AP SPORTS</Text>
          <Text style={[styles.brandTagline, { color: colors.textMuted }]}>
            Dụng Cụ & Trang Phục Chính Hãng
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        {/* Nút Dark/Light Mode */}
        <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme} activeOpacity={0.8}>
          <Ionicons
            name={isDarkMode ? 'sunny' : 'moon-outline'}
            size={22}
            color={isDarkMode ? '#f59e0b' : colors.text}
          />
        </TouchableOpacity>

        {/* Nút Chatbot & Live Support */}
        <TouchableOpacity style={styles.iconBtn} onPress={handleChatPress} activeOpacity={0.8}>
          <Ionicons name="chatbubbles-outline" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Nút Giỏ Hàng */}
        <TouchableOpacity style={styles.cartIconBtn} onPress={handleCartPress} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={24} color={colors.text} />
          {resolvedCartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.cartBadgeText}>
                {resolvedCartCount > 99 ? '99+' : resolvedCartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: Typography.weights.medium,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  cartIconBtn: {
    position: 'relative',
    padding: Spacing.xs,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
});
