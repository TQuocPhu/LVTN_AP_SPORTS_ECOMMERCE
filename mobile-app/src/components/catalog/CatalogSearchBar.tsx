import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, Typography } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface CatalogSearchBarProps {
  keyword: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export const CatalogSearchBar: React.FC<CatalogSearchBarProps> = ({
  keyword,
  onChangeText,
  onClear,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.searchBox,
        {
          backgroundColor: colors.inputBg,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name="search-outline" size={20} color={colors.textMuted} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder="Tìm kiếm giày bóng đá, vợt cầu lông, võ phục..."
        placeholderTextColor={colors.textMuted}
        value={keyword}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
      {keyword.length > 0 && (
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.xs,
  },
});
