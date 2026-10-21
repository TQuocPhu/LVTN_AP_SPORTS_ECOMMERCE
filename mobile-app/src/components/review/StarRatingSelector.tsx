import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../config/theme';

interface StarRatingSelectorProps {
  rating: number;
  onSelectRating: (rating: number) => void;
}

export const StarRatingSelector: React.FC<StarRatingSelectorProps> = ({
  rating,
  onSelectRating,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Mức độ hài lòng của bạn</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onSelectRating(star)}
            activeOpacity={0.7}
            style={styles.starBtn}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={36}
              color={star <= rating ? '#eab308' : Colors.slate300}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.ratingText}>
        {rating === 5 && 'Tuyệt vời, cực kỳ hài lòng! 🌟'}
        {rating === 4 && 'Rất tốt, sản phẩm chuẩn đẹp 👍'}
        {rating === 3 && 'Tạm ổn, đúng như mô tả 👌'}
        {rating === 2 && 'Chưa hài lòng lắm 😕'}
        {rating === 1 && 'Rất thất vọng 😞'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
    marginBottom: Spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  starBtn: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.slate700,
  },
});
