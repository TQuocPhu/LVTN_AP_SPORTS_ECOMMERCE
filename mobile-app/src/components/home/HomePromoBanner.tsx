import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface HomePromoBannerProps {
  onExplorePress: () => void;
}

export const HomePromoBanner: React.FC<HomePromoBannerProps> = ({ onExplorePress }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDarkMode ? '#0f172a' : '#1e293b',
          borderColor: isDarkMode ? '#334155' : '#475569',
        },
      ]}
    >
      <View style={[styles.badgeSale, { backgroundColor: colors.primary }]}>
        <Text style={styles.badgeSaleText}>GIẢM ĐẾN 40%</Text>
      </View>
      <Text style={styles.bannerTitle}>MÙA GIẢI THỂ THAO 2026</Text>
      <Text style={styles.bannerSubtitle}>
        Giày bóng đá đinh FG/TF chính hãng, vợt cầu lông carbon & trang thiết bị võ thuật chuẩn thi đấu.
      </Text>
      <TouchableOpacity
        style={[styles.btnExplore, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={onExplorePress}
      >
        <Text style={styles.btnExploreText}>Khám Phá Ngay</Text>
        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  badgeSale: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  badgeSaleText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: Typography.weights.black,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#cbd5e1',
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  btnExplore: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  btnExploreText: {
    color: '#ffffff',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
