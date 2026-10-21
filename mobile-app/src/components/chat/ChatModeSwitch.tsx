import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface ChatModeSwitchProps {
  chatMode: 'ai' | 'live';
  onSelectMode: (mode: 'ai' | 'live') => void;
}

export const ChatModeSwitch: React.FC<ChatModeSwitchProps> = ({ chatMode, onSelectMode }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tabBtn, chatMode === 'ai' && styles.tabBtnActive]}
        onPress={() => onSelectMode('ai')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="sparkles"
          size={16}
          color={chatMode === 'ai' ? Colors.white : Colors.slate600}
        />
        <Text style={[styles.tabText, chatMode === 'ai' && styles.tabTextActive]}>
          Trợ Lý Thể Thao AI
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabBtn, chatMode === 'live' && styles.tabBtnActive]}
        onPress={() => onSelectMode('live')}
        activeOpacity={0.8}
      >
        <Ionicons
          name="headset"
          size={16}
          color={chatMode === 'live' ? Colors.white : Colors.slate600}
        />
        <Text style={[styles.tabText, chatMode === 'live' && styles.tabTextActive]}>
          Gặp Nhân Viên CSKH
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.slate100,
    borderRadius: BorderRadius.xl,
    padding: 4,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate600,
  },
  tabTextActive: {
    color: Colors.white,
  },
});
