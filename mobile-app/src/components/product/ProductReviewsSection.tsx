import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius, Typography } from '../../config/theme';

interface ReviewItemData {
  id: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  imageUrls?: string[];
  adminReply?: string;
  repliedByName?: string;
  repliedAt?: string;
  createdAt: string;
  verifiedPurchase?: boolean;
  variantSummary?: string;
}

interface ReviewSummaryData {
  averageRating: number;
  totalReviews: number;
  fiveStarCount?: number;
  fourStarCount?: number;
  threeStarCount?: number;
  twoStarCount?: number;
  oneStarCount?: number;
}

interface ProductReviewsSectionProps {
  reviews: ReviewItemData[];
  summary?: ReviewSummaryData | null;
  loading?: boolean;
}

/**
 * Component hiển thị danh sách Đánh giá & Bình luận của khách hàng về sản phẩm
 */
export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  reviews,
  summary,
  loading,
}) => {
  const { colors } = useTheme();

  const averageRating = summary?.averageRating ?? (reviews.length > 0 ? 5.0 : 0);
  const totalReviews = summary?.totalReviews ?? reviews.length;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={[styles.accentPill, { backgroundColor: colors.primary }]} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ĐÁNH GIÁ SẢN PHẨM ({totalReviews})
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Đang tải đánh giá từ khách hàng...
          </Text>
        </View>
      ) : totalReviews === 0 && reviews.length === 0 ? (
        /* Empty State */
        <View style={[styles.emptyBox, { backgroundColor: colors.slate100 }]}>
          <Ionicons name="chatbubbles-outline" size={36} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Chưa có đánh giá nào
          </Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            Hãy là khách hàng đầu tiên sở hữu và chia sẻ cảm nhận về sản phẩm này!
          </Text>
        </View>
      ) : (
        <>
          {/* Summary Box */}
          <View style={[styles.summaryBox, { backgroundColor: colors.slate100 }]}>
            <View style={styles.scoreCol}>
              <Text style={[styles.scoreNumber, { color: colors.primary }]}>
                {averageRating.toFixed(1)}
              </Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(averageRating) ? 'star' : 'star-outline'}
                    size={16}
                    color="#f59e0b"
                  />
                ))}
              </View>
              <Text style={[styles.totalCountText, { color: colors.textMuted }]}>
                {totalReviews} đánh giá thực tế
              </Text>
            </View>

            {/* Rating Bars */}
            <View style={styles.barsCol}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count =
                  star === 5
                    ? summary?.fiveStarCount || reviews.filter((r) => r.rating === 5).length
                    : star === 4
                    ? summary?.fourStarCount || reviews.filter((r) => r.rating === 4).length
                    : star === 3
                    ? summary?.threeStarCount || reviews.filter((r) => r.rating === 3).length
                    : star === 2
                    ? summary?.twoStarCount || reviews.filter((r) => r.rating === 2).length
                    : summary?.oneStarCount || reviews.filter((r) => r.rating === 1).length;

                const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <View key={star} style={styles.barRow}>
                    <Text style={[styles.starLabel, { color: colors.textMuted }]}>
                      {star}★
                    </Text>
                    <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barCount, { color: colors.textMuted }]}>
                      {count}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* List of Reviews */}
          <View style={styles.reviewsList}>
            {reviews.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.reviewCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* User Row */}
                <View style={styles.userRow}>
                  {item.userAvatar ? (
                    <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                      <Text style={styles.avatarLetter}>
                        {item.userName ? item.userName.charAt(0).toUpperCase() : 'U'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.userInfoCol}>
                    <Text style={[styles.userName, { color: colors.text }]}>
                      {item.userName || 'Khách hàng AP Sports'}
                    </Text>
                    {item.verifiedPurchase && (
                      <View style={styles.verifiedRow}>
                        <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                        <Text style={styles.verifiedText}>Đã mua hàng tại AP Sports</Text>
                      </View>
                    )}
                  </View>

                  <Text style={[styles.dateText, { color: colors.textMuted }]}>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>

                {/* Stars and Variant */}
                <View style={styles.ratingAndVariant}>
                  <View style={styles.starsRowSmall}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name={s <= item.rating ? 'star' : 'star-outline'}
                        size={13}
                        color="#f59e0b"
                      />
                    ))}
                  </View>

                  {item.variantSummary && (
                    <Text style={[styles.variantText, { color: colors.textMuted }]}>
                      Phân loại: {item.variantSummary}
                    </Text>
                  )}
                </View>

                {/* Comment Content */}
                <Text style={[styles.commentText, { color: colors.text }]}>
                  {item.comment}
                </Text>

                {/* Customer Photos */}
                {item.imageUrls && item.imageUrls.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.photosScroll}
                  >
                    {item.imageUrls.map((imgUri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: imgUri }}
                        style={styles.reviewPhoto}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                )}

                {/* Admin Reply */}
                {item.adminReply && (
                  <View
                    style={[
                      styles.adminReplyBox,
                      {
                        backgroundColor: colors.slate100,
                        borderLeftColor: colors.primary,
                      },
                    ]}
                  >
                    <View style={styles.adminHeader}>
                      <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                      <Text style={[styles.adminTitle, { color: colors.primary }]}>
                        Phản hồi từ AP Sports ({item.repliedByName || 'Chuyên viên CSKH'})
                      </Text>
                    </View>
                    <Text style={[styles.adminContent, { color: colors.text }]}>
                      {item.adminReply}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  accentPill: {
    width: 4,
    height: 18,
    borderRadius: BorderRadius.full,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
    letterSpacing: 0.5,
  },
  loadingBox: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.sizes.xs,
  },
  emptyBox: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xs,
  },
  emptyDesc: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  scoreCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    minWidth: 100,
  },
  scoreNumber: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.black,
    lineHeight: 32,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  totalCountText: {
    fontSize: Typography.sizes.xs,
  },
  barsCol: {
    flex: 1,
    paddingLeft: Spacing.md,
    gap: 3,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starLabel: {
    fontSize: 10,
    width: 18,
    textAlign: 'right',
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  barCount: {
    fontSize: 10,
    width: 20,
  },
  reviewsList: {
    gap: Spacing.md,
  },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
  },
  avatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  dateText: {
    fontSize: Typography.sizes.xs,
  },
  ratingAndVariant: {
    marginVertical: Spacing.sm,
    gap: 4,
  },
  starsRowSmall: {
    flexDirection: 'row',
    gap: 2,
  },
  variantText: {
    fontSize: Typography.sizes.xs,
    fontStyle: 'italic',
  },
  commentText: {
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  photosScroll: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
  },
  reviewPhoto: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.xs,
  },
  adminReplyBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  adminTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  adminContent: {
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
  },
});
