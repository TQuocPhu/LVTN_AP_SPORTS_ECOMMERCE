import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface ChatQuickPromptsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export const ChatQuickPrompts: React.FC<ChatQuickPromptsProps> = ({ prompts, onSelectPrompt }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GỢI Ý CÂU HỎI THỂ THAO:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((p, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.pill}
            activeOpacity={0.75}
            onPress={() => onSelectPrompt(p)}
          >
            <Text style={styles.pillText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate100,
  },
  title: {
    fontSize: 10,
    fontWeight: Typography.weights.black,
    color: Colors.slate400,
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  pill: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.2)',
  },
  pillText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
});
