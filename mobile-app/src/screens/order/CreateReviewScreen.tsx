import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';
import { Header } from '../../components/common/Header';
import { useCustomerReview } from '../../hooks/useCustomerReview';
import { StarRatingSelector } from '../../components/review/StarRatingSelector';
import { PhotoPickerSection } from '../../components/review/PhotoPickerSection';

export const CreateReviewScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateReview'>>();
  const { productId, orderItemId, productName, productImage, variantSummary } = route.params;

  const {
    rating,
    setRating,
    comment,
    setComment,
    photos,
    isSubmitting,
    handleTakePhoto,
    handlePickFromLibrary,
    handleRemovePhoto,
    submitReview,
  } = useCustomerReview(productId, orderItemId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Đánh Giá Sản Phẩm" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Thông tin sản phẩm cần đánh giá */}
        <View style={styles.productCard}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.productImg} resizeMode="cover" />
          ) : (
            <View style={styles.productImgPlaceholder}>
              <Ionicons name="football-outline" size={24} color={Colors.slate400} />
            </View>
          )}
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
            </Text>
            {variantSummary ? (
              <Text style={styles.variantSummary}>Phân loại: {variantSummary}</Text>
            ) : null}
          </View>
        </View>

        {/* Chọn số sao */}
        <StarRatingSelector rating={rating} onSelectRating={setRating} />

        {/* Chụp ảnh thực tế & Đăng ảnh */}
        <PhotoPickerSection
          photos={photos}
          onTakePhoto={handleTakePhoto}
          onPickFromLibrary={handlePickFromLibrary}
          onRemovePhoto={handleRemovePhoto}
        />

        {/* Viết nhận xét chi tiết */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nhận xét chi tiết</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Hãy chia sẻ cảm nhận chân thật về chất lượng đế, độ ôm chân, trọng lượng bóng, đóng gói niêm phong barcode..."
            placeholderTextColor={Colors.slate400}
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            maxLength={2000}
          />
          <View style={styles.charCountRow}>
            <Text
              style={[
                styles.charCountText,
                comment.trim().length < 10 && { color: Colors.error },
              ]}
            >
              {comment.trim().length} / 2000 ký tự (Tối thiểu 10 ký tự)
            </Text>
          </View>
        </View>

        {/* Nút gửi đánh giá */}
        <TouchableOpacity
          style={[
            styles.btnSubmit,
            (comment.trim().length < 10 || isSubmitting) && styles.btnDisabled,
          ]}
          onPress={submitReview}
          disabled={comment.trim().length < 10 || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Text style={styles.btnSubmitText}>Gửi Đánh Giá Ngay</Text>
              <Ionicons name="paper-plane-outline" size={18} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.slate200,
    alignItems: 'center',
  },
  productImg: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.slate100,
  },
  productImgPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  productName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
  },
  variantSummary: {
    fontSize: 11,
    color: Colors.slate500,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
    marginBottom: Spacing.xs,
  },
  commentInput: {
    backgroundColor: Colors.slate50,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.xs,
    textAlignVertical: 'top',
    height: 110,
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  charCountText: {
    fontSize: 10,
    color: Colors.slate500,
  },
  btnSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  btnSubmitText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
