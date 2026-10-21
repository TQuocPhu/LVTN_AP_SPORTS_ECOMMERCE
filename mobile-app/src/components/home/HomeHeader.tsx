import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface HomeHeaderProps {
  cartItemCount: number;
  onCartPress: () => void;
  onChatPress: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  cartItemCount,
  onCartPress,
  onChatPress,
}) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.brandRow}>
        <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoBadgeText}>AP</Text>
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
        <TouchableOpacity style={styles.iconBtn} onPress={onChatPress} activeOpacity={0.8}>
          <Ionicons name="chatbubbles-outline" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Nút Giỏ Hàng */}
        <TouchableOpacity style={styles.cartIconBtn} onPress={onCartPress} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={24} color={colors.text} />
          {cartItemCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.cartBadgeText}>{cartItemCount > 99 ? '99+' : cartItemCount}</Text>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#ffffff',
    fontWeight: Typography.weights.black,
    fontSize: Typography.sizes.sm,
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
