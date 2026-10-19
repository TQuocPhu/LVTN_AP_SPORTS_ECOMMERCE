'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  SizeGuideCategoryType,
  SHOE_SIZE_DATA,
  APPAREL_SIZE_DATA,
} from '@/types/size-guide';

interface UseSizeGuideModalParams {
  categoryName?: string;
  productName?: string;
  availableSizes?: string[];
}

export function useSizeGuideModal({
  categoryName = '',
  productName = '',
  availableSizes = [],
}: UseSizeGuideModalParams = {}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // 1. Tự động nhận diện Danh mục (Category-Aware Detection)
  const detectedCategory = useMemo<SizeGuideCategoryType>(() => {
    const textToMatch = `${categoryName} ${productName}`.toLowerCase();

    // 1.1 Nhận diện Giày
    if (
      textToMatch.includes('giày') ||
      textToMatch.includes('shoe') ||
      textToMatch.includes('boot') ||
      textToMatch.includes('cleat') ||
      textToMatch.includes('sneaker') ||
      textToMatch.includes('đinh')
    ) {
      return 'shoes';
    }

    // 1.2 Nhận diện Găng tay thủ môn
    if (textToMatch.includes('găng') || textToMatch.includes('glove')) {
      return 'gloves';
    }

    // 1.3 Nhận diện Quả bóng đá
    if (
      textToMatch.includes('quả bóng') ||
      textToMatch.includes('trái bóng') ||
      (textToMatch.includes('bóng đá') && !textToMatch.includes('áo') && !textToMatch.includes('quần'))
    ) {
      return 'football';
    }

    // 1.4 Nhận diện Quần áo thể thao
    if (
      textToMatch.includes('áo') ||
      textToMatch.includes('quần') ||
      textToMatch.includes('bộ đấu') ||
      textToMatch.includes('jersey') ||
      textToMatch.includes('shirt') ||
      textToMatch.includes('short') ||
      textToMatch.includes('jacket') ||
      textToMatch.includes('hoodie') ||
      textToMatch.includes('trang phục')
    ) {
      return 'apparel';
    }

    // 1.5 Kiểm tra theo danh sách kích thước hiện có của sản phẩm
    if (availableSizes && availableSizes.length > 0) {
      const hasNumericShoeSize = availableSizes.some((s) => {
        const num = parseFloat(s);
        return !isNaN(num) && num >= 36 && num <= 46;
      });
      if (hasNumericShoeSize) return 'shoes';

      const hasApparelSize = availableSizes.some((s) =>
        ['s', 'm', 'l', 'xl', 'xxl', '2xl', '3xl', 'xs'].includes(s.toLowerCase().trim())
      );
      if (hasApparelSize) return 'apparel';

      const hasFootballSize = availableSizes.some((s) =>
        s.toLowerCase().includes('size 3') || s.toLowerCase().includes('size 4') || s.toLowerCase().includes('size 5')
      );
      if (hasFootballSize) return 'football';
    }

    // 1.6 Kiểm tra các phụ kiện không có bảng size (băng keo, còi, bình nước, balo...)
    if (
      textToMatch.includes('băng keo') ||
      textToMatch.includes('tất') ||
      textToMatch.includes('vớ') ||
      textToMatch.includes('bình nước') ||
      textToMatch.includes('túi') ||
      textToMatch.includes('balo') ||
      textToMatch.includes('còi') ||
      textToMatch.includes('bọc ống đồng')
    ) {
      return 'none';
    }

    // Mặc định nếu không rõ nhưng có size thì cho phép mở xem
    return availableSizes && availableSizes.length > 0 ? 'shoes' : 'none';
  }, [categoryName, productName, availableSizes]);

  const [activeCategory, setActiveCategory] = useState<SizeGuideCategoryType>(
    detectedCategory !== 'none' ? detectedCategory : 'shoes'
  );

  // 2. State & Logic tính toán nhanh Size Giày
  const [footLength, setFootLength] = useState<string>('26.0');
  const recommendedShoeSize = useMemo(() => {
    const len = parseFloat(footLength);
    if (isNaN(len) || len < 22 || len > 30) return null;
    // Tìm size có cm >= chiều dài bàn chân
    const found = SHOE_SIZE_DATA.find((item) => item.cm >= len);
    return found ? found.eu : '45+';
  }, [footLength]);

  // 3. State & Logic tính toán nhanh Size Quần Áo
  const [userHeight, setUserHeight] = useState<string>('172');
  const [userWeight, setUserWeight] = useState<string>('68');
  const recommendedApparelSize = useMemo(() => {
    const h = parseFloat(userHeight);
    const w = parseFloat(userWeight);
    if (isNaN(h) || isNaN(w)) return null;

    if (h < 165 && w < 57) return 'S';
    if (h <= 170 && w <= 65) return 'M';
    if (h <= 175 && w <= 74) return 'L';
    if (h <= 182 && w <= 82) return 'XL';
    if (h <= 188 && w <= 92) return 'XXL';
    return '3XL';
  }, [userHeight, userWeight]);

  const openModal = useCallback(() => {
    if (detectedCategory !== 'none') {
      setActiveCategory(detectedCategory);
    }
    setIsOpen(true);
  }, [detectedCategory]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    hasSizeGuide: detectedCategory !== 'none',
    detectedCategory,
    activeCategory,
    setActiveCategory,
    // Công cụ tính size giày
    footLength,
    setFootLength,
    recommendedShoeSize,
    // Công cụ tính size quần áo
    userHeight,
    setUserHeight,
    userWeight,
    setUserWeight,
    recommendedApparelSize,
  };
}
