import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { reviewController } from '../controllers/review-controller';

export const useCustomerReview = (productId: number, orderItemId: number) => {
  const navigation = useNavigation();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mở máy ảnh chụp trực tiếp giày/bóng thực tế
  const handleTakePhoto = useCallback(async () => {
    if (photos.length >= 5) {
      Alert.alert('Giới hạn ảnh', 'Bạn chỉ có thể đính kèm tối đa 5 hình ảnh thực tế.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền máy ảnh trong cài đặt để chụp ảnh sản phẩm.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhotos((prev) => [...prev, base64Data]);
    }
  }, [photos.length]);

  // Chọn ảnh từ thư viện
  const handlePickFromLibrary = useCallback(async () => {
    if (photos.length >= 5) {
      Alert.alert('Giới hạn ảnh', 'Bạn chỉ có thể đính kèm tối đa 5 hình ảnh thực tế.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      const base64Data = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhotos((prev) => [...prev, base64Data]);
    }
  }, [photos.length]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const submitReview = useCallback(async () => {
    if (comment.trim().length < 10) {
      Alert.alert('Nhận xét quá ngắn', 'Vui lòng chia sẻ cảm nhận ít nhất 10 ký tự về chất lượng giày/dụng cụ.');
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewController.submitReview({
        productId,
        orderItemId,
        rating,
        comment: comment.trim(),
        imageUrls: photos,
      });

      Alert.alert(
        'Đánh giá thành công! 🌟',
        'Cảm ơn bạn đã đóng góp đánh giá và hình ảnh thực tế cho cộng đồng thể thao AP Sports.',
        [
          {
            text: 'Tuyệt vời',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || err?.message || 'Không thể gửi đánh giá, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [productId, orderItemId, rating, comment, photos, navigation]);

  return {
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
  };
};
