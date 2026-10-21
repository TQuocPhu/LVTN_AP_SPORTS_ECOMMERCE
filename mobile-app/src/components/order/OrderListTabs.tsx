import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Spacing, BorderRadius, Typography } from '../../config/theme';
import { StatusTab } from '../../hooks/useCustomerOrders';
import { useTheme } from '../../context/ThemeContext';

interface OrderListTabsProps {
  tabs: StatusTab[];
  activeTab: string;
  onSelectTab: (key: string) => void;
}

export const OrderListTabs: React.FC<OrderListTabsProps> = ({
  tabs,
  activeTab,
  onSelectTab,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tabs}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.tabContent}
        renderItem={({ item }) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              style={[
                styles.tabBtn,
                {
                  backgroundColor: isActive ? colors.primary : colors.slate100,
                },
              ]}
              onPress={() => onSelectTab(item.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? '#ffffff' : colors.textMuted,
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderBottomWidth: 1,
  },
  tabContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  tabBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
