import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={[styles.brandBadge, { borderColor: colors.border, backgroundColor: colors.surface2 }]}>
          <Image
            source={require('../../../assets/ap-sports_logo_no-back.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {rightAction && <View style={styles.right}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandLogo: {
    width: '100%',
    height: '100%',
  },
  title: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
