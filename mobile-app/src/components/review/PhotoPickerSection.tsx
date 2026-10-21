import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../../config/theme';

interface PhotoPickerSectionProps {
  photos: string[];
  onTakePhoto: () => void;
  onPickFromLibrary: () => void;
  onRemovePhoto: (index: number) => void;
}

export const PhotoPickerSection: React.FC<PhotoPickerSectionProps> = ({
  photos,
  onTakePhoto,
  onPickFromLibrary,
  onRemovePhoto,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Hình ảnh thực tế trên tay ({photos.length}/5)</Text>
      <Text style={styles.subtitle}>
        Chụp ảnh cận cảnh form giày, chất da, đường may hoặc bóng thực tế để nhận điểm thưởng thành viên.
      </Text>

      {/* Nút hành động chụp / chọn ảnh */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.btnAction} onPress={onTakePhoto} activeOpacity={0.8}>
          <Ionicons name="camera" size={20} color={Colors.primary} />
          <Text style={styles.btnActionText}>Chụp Ảnh Ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnAction, styles.btnActionSecondary]}
          onPress={onPickFromLibrary}
          activeOpacity={0.8}
        >
          <Ionicons name="images-outline" size={20} color={Colors.slate700} />
          <Text style={[styles.btnActionText, { color: Colors.slate700 }]}>Thư Viện Ảnh</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách ảnh đã chọn */}
      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          {photos.map((uri, idx) => (
            <View key={idx} style={styles.thumbWrapper}>
              <Image source={{ uri }} style={styles.thumb} />
              <TouchableOpacity style={styles.deleteBtn} onPress={() => onRemovePhoto(idx)}>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.slate200,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.slate900,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.slate500,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 10,
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnActionSecondary: {
    backgroundColor: Colors.slate100,
    borderColor: Colors.slate300,
  },
  btnActionText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  photosScroll: {
    marginTop: Spacing.xs,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: Spacing.sm,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.slate100,
  },
  deleteBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
});
