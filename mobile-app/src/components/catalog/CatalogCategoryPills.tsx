import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Spacing, BorderRadius, Typography } from '../../config/theme';
import { Category } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CatalogCategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CatalogCategoryPills: React.FC<CatalogCategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.pill,
            { backgroundColor: selectedCategory === 'all' ? colors.primary : colors.slate100 },
          ]}
          onPress={() => onSelectCategory('all')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.pillText,
              { color: selectedCategory === 'all' ? '#ffffff' : colors.textMuted },
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => {
          const isActive = selectedCategory === cat.slug;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                { backgroundColor: isActive ? colors.primary : colors.slate100 },
              ]}
              onPress={() => onSelectCategory(cat.slug)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: isActive ? '#ffffff' : colors.textMuted },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
