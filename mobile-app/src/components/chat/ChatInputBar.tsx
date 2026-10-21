import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending?: boolean;
  placeholder?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChangeText,
  onSend,
  sending,
  placeholder = 'Nhập tin nhắn tư vấn...',
}) => {
  const canSend = value.trim().length > 0 && !sending;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.slate400}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={2}
      />
      <TouchableOpacity
        style={[styles.btnSend, !canSend && styles.btnSendDisabled]}
        onPress={onSend}
        disabled={!canSend}
        activeOpacity={0.8}
      >
        {sending ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Ionicons name="arrow-up" size={20} color={Colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.slate100,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: Typography.sizes.xs,
    color: Colors.slate900,
    maxHeight: 80,
  },
  btnSend: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSendDisabled: {
    backgroundColor: Colors.slate300,
  },
});
