import React from 'react';
import { View, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductGalleryProps {
  images: string[];
  activeImageIndex: number;
  onScrollIndexChange: (index: number) => void;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  activeImageIndex,
  onScrollIndexChange,
}) => {
  if (images.length === 0) {
    return (
      <View style={styles.placeholderImg}>
        <Ionicons name="football-outline" size={80} color={Colors.slate300} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIdx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          onScrollIndexChange(newIdx);
        }}
      >
        {images.map((imgUri, index) => (
          <Image
            key={index}
            source={{ uri: imgUri }}
            style={styles.galleryImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Pagination dots */}
      {images.length > 1 && (
        <View style={styles.paginationDots}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === activeImageIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: Colors.white,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 340,
    backgroundColor: Colors.slate100,
  },
  placeholderImg: {
    width: SCREEN_WIDTH,
    height: 340,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationDots: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
