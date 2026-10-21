import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Typography } from '../../config/theme';
import { stripHtmlToText } from '../../utils/formatHtml';

interface ProductDescriptionSectionProps {
  description?: string;
}

/**
 * Component hiển thị mô tả chi tiết sản phẩm chuẩn đẹp như Web AP Sports.
 * Chuyển đổi mã HTML thành các khối đoạn văn và bullet points có cấu trúc trực quan.
 */
export const ProductDescriptionSection: React.FC<ProductDescriptionSectionProps> = ({
  description,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanText = useMemo(() => {
    return stripHtmlToText(description) ||
      'Sản phẩm thể thao chính hãng cao cấp AP Sports, thiết kế tối ưu hiệu suất vận động và độ bền vượt trội.';
  }, [description]);

  const paragraphs = useMemo(() => {
    return cleanText.split('\n\n').filter((p) => p.trim().length > 0);
  }, [cleanText]);

  const isLong = paragraphs.length > 2 || cleanText.length > 220;
  const displayedParagraphs = !isExpanded && isLong ? paragraphs.slice(0, 2) : paragraphs;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.accentPill, { backgroundColor: colors.primary }]} />
        <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>CHI TIẾT SẢN PHẨM & MÔ TẢ</Text>
      </View>

      <View style={[styles.contentCard, { backgroundColor: colors.surface2, borderColor: colors.border }]}>
        {displayedParagraphs.map((para, index) => {
          const lines = para.split('\n');
          return (
            <View key={index} style={styles.paragraphBox}>
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
                const content = isBullet ? trimmed.replace(/^[•\-]\s*/, '') : trimmed;

                if (isBullet) {
                  return (
                    <View key={lIdx} style={styles.bulletRow}>
                      <Ionicons name="shield-checkmark" size={14} color={colors.primary} style={styles.bulletIcon} />
                      <Text style={[styles.bulletText, { color: colors.text }]}>{content}</Text>
                    </View>
                  );
                }

                return (
                  <Text key={lIdx} style={[styles.bodyText, { color: colors.textSecondary }]}>
                    {content}
                  </Text>
                );
              })}
            </View>
          );
        })}

        {isLong && (
          <TouchableOpacity
            style={[styles.btnToggle, { borderTopColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => setIsExpanded((prev) => !prev)}
          >
            <Text style={[styles.btnToggleText, { color: colors.primary }]}>
              {isExpanded ? 'Thu gọn mô tả' : 'Xem thêm toàn bộ mô tả chi tiết'}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  accentPill: {
    width: 4,
    height: 18,
    borderRadius: BorderRadius.full,
    marginRight: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.black,
    letterSpacing: 0.5,
  },
  contentCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  paragraphBox: {
    marginBottom: Spacing.sm,
  },
  bodyText: {
    fontSize: Typography.sizes.sm,
    lineHeight: 22,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    paddingLeft: Spacing.xs,
  },
  bulletIcon: {
    marginTop: 4,
    marginRight: Spacing.xs,
  },
  bulletText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
    fontWeight: Typography.weights.medium,
  },
  btnToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: Spacing.md,
    marginTop: Spacing.xs,
    borderTopWidth: 1,
  },
  btnToggleText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
