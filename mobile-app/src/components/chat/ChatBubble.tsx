import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface ChatBubbleProps {
  isUser: boolean;
  senderName?: string;
  text: string;
  timestamp?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  isUser,
  senderName,
  text,
  timestamp,
}) => {
  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperOther]}>
      {!isUser && senderName && <Text style={styles.senderLabel}>{senderName}</Text>}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextOther]}>
          {text}
        </Text>
      </View>
      {timestamp && (
        <Text style={[styles.timeLabel, isUser ? styles.timeUser : styles.timeOther]}>
          {timestamp}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    maxWidth: '82%',
  },
  wrapperUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontSize: 10,
    color: Colors.slate500,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.xl,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.slate100,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
  },
  bubbleTextUser: {
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },
  bubbleTextOther: {
    color: Colors.slate900,
  },
  timeLabel: {
    fontSize: 9,
    color: Colors.slate400,
    marginTop: 2,
    marginHorizontal: 4,
  },
  timeUser: {
    textAlign: 'right',
  },
  timeOther: {
    textAlign: 'left',
  },
});
