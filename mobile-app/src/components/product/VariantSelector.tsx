import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface VariantSelectorProps {
  availableColors: string[];
  selectedColor: string | null;
  onSelectColor: (color: string) => void;
  availableSizes: string[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  onOpenSizeGuide: () => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  availableColors,
  selectedColor,
  onSelectColor,
  availableSizes,
  selectedSize,
  onSelectSize,
  onOpenSizeGuide,
}) => {
  return (
    <View style={styles.container}>
      {/* Màu sắc */}
      {availableColors.length > 0 && (
        <View style={styles.selectorGroup}>
          <Text style={styles.groupLabel}>
            Màu sắc:{' '}
            <Text style={styles.groupValue}>{selectedColor || 'Chọn màu'}</Text>
          </Text>
          <View style={styles.optionsWrap}>
            {availableColors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
                  onPress={() => onSelectColor(color)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Kích cỡ */}
      {availableSizes.length > 0 && (
        <View style={styles.selectorGroup}>
          <View style={styles.sizeHeaderRow}>
            <Text style={styles.groupLabel}>
              Kích cỡ:{' '}
              <Text style={styles.groupValue}>{selectedSize || 'Chọn size'}</Text>
            </Text>
            <TouchableOpacity
              style={styles.btnGuide}
              activeOpacity={0.7}
              onPress={onOpenSizeGuide}
            >
              <Ionicons name="help-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.btnGuideText}>Bảng Đo Chuẩn Size</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsWrap}>
            {availableSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeOptionBtn, isSelected && styles.optionBtnActive]}
                  onPress={() => onSelectSize(size)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.sizeOptionText, isSelected && styles.optionTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    gap: Spacing.md,
  },
  selectorGroup: {
    gap: Spacing.xs,
  },
  sizeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.slate600,
    fontWeight: Typography.weights.semibold,
  },
  groupValue: {
    color: Colors.slate900,
    fontWeight: Typography.weights.bold,
  },
  btnGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btnGuideText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: 4,
  },
  optionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.slate300,
    backgroundColor: Colors.white,
  },
  sizeOptionBtn: {
    minWidth: 44,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.slate300,
    backgroundColor: Colors.white,
  },
  optionBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  optionText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate700,
  },
  sizeOptionText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.black,
    color: Colors.slate800,
  },
  optionTextActive: {
    color: Colors.primaryDark,
  },
});
