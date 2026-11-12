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
  showOrderButton?: boolean;
  isOrderPickerActive?: boolean;
  hasAttachment?: boolean;
  onToggleOrderPicker?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChangeText,
  onSend,
  sending,
  placeholder = 'Nhập tin nhắn tư vấn...',
  showOrderButton = false,
  isOrderPickerActive = false,
  hasAttachment = false,
  onToggleOrderPicker,
}) => {
  const canSend = (value.trim().length > 0 || hasAttachment) && !sending;

  return (
    <View style={styles.container}>
      {showOrderButton && onToggleOrderPicker && (
        <TouchableOpacity
          style={[
            styles.btnOrder,
            isOrderPickerActive && styles.btnOrderActive,
          ]}
          onPress={onToggleOrderPicker}
          disabled={sending}
          activeOpacity={0.8}
        >
          <Ionicons
            name="cube-outline"
            size={20}
            color={isOrderPickerActive ? Colors.primary : Colors.slate600}
          />
        </TouchableOpacity>
      )}
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
  btnOrder: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.slate100,
    borderWidth: 1,
    borderColor: Colors.slate200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOrderActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
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
