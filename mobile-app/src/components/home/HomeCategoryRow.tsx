import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../config/theme';
import { Category } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HomeCategoryRowProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

const getCategoryIcon = (slug: string): keyof typeof Ionicons.glyphMap => {
  if (slug.includes('bong-da') || slug.includes('football')) return 'football-outline';
  if (slug.includes('cau-long') || slug.includes('badminton')) return 'tennisball-outline';
  if (slug.includes('vo-thuat') || slug.includes('karate')) return 'shield-checkmark-outline';
  if (slug.includes('bong-ro') || slug.includes('basketball')) return 'basketball-outline';
  if (slug.includes('chay-bo') || slug.includes('running')) return 'walk-outline';
  return 'fitness-outline';
};

export const HomeCategoryRow: React.FC<HomeCategoryRowProps> = ({
  categories,
  onSelectCategory,
}) => {
  const { colors } = useTheme();

  if (!categories || categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>MÔN THỂ THAO</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryItem}
            activeOpacity={0.7}
            onPress={() => onSelectCategory(cat)}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <Ionicons name={getCategoryIcon(cat.slug)} size={24} color={colors.primary} />
            </View>
            <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.black,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    gap: Spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 68,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
});
