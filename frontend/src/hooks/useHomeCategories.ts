'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { categoryController } from '@/controllers/category-controller';
import { CategoryResponse } from '@/types/category';

/**
 * Kiểu dữ liệu đã chuẩn hóa cho từng thẻ Danh mục hiển thị trên Trang chủ khách hàng.
 */
export interface HomeCategoryCardItem {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  image: string;
  link: string;
  countLabel: string;
  badge: string;
}

/**
 * Bản đồ cấu hình hình ảnh banner và nhãn (badge) mặc định theo slug 6 bộ môn gốc của AP Sports.
 * Sẽ được sử dụng làm fallback khi danh mục gốc trong Database chưa được tải ảnh riêng lên Cloudinary.
 */
const SPORT_VISUAL_FALLBACKS: Record<
  string,
  { image: string; badge: string; defaultDesc: string }
> = {
  'bong-da': {
    image: '/images/banners/sub_football_banner.png',
    badge: 'CHỦ ĐẠO',
    defaultDesc: 'Giày đinh TF/FG, quần áo đấu CLB & bóng thi đấu chuẩn FIFA',
  },
  'cau-long': {
    image: '/images/banners/sub_badminton_volleyball_banner.png',
    badge: 'BÁN CHẠY',
    defaultDesc: 'Vợt Carbon trợ lực, giày bám sân chuyên dụng & phụ kiện cầu lông',
  },
  'bong-ro': {
    image: '/images/banners/sub_karate_basketball_banner.png',
    badge: 'CHÍNH HÃNG',
    defaultDesc: 'Bóng rổ da PU số 7 chuẩn thi đấu, đồng phục & băng bảo vệ khớp',
  },
  'bong-chuyen': {
    image: '/images/banners/sub_badminton_volleyball_banner.png',
    badge: 'PHONG TRÀO',
    defaultDesc: 'Quả bóng chuyền da mềm êm tay, trang phục & bó gối giảm chấn',
  },
  'gym-chay-bo': {
    image: '/images/banners/sub_fitness_accessories_banner.png',
    badge: 'HOT TREND',
    defaultDesc: 'Trang phục Dry-Fit, giày chạy bộ êm ái & phụ kiện kháng lực',
  },
  'vo-thuat': {
    image: '/images/banners/home_promo_karate.jpg',
    badge: 'CHUẨN WKF',
    defaultDesc: 'Võ phục Karate, Taekwondo, găng tay Boxing & giáp bảo hộ thi đấu',
  },
};

/**
 * Custom Hook quản lý dữ liệu Danh mục sản phẩm trên Trang chủ khách hàng.
 * Tuân thủ Layer Architecture:
 * - Gọi tới `categoryController.getPrimaryCategories()` (được hỗ trợ bởi Redis Cache ở Backend).
 * - Đóng gói toàn bộ React state/effect và chuẩn hóa dữ liệu để Component `CategoryGrid` chỉ việc hiển thị.
 */
export function useHomeCategories() {
  const [rawCategories, setRawCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Tải danh sách các danh mục gốc (Primary Categories - Cấp 1) từ Backend API.
   */
  const fetchPrimaryCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await categoryController.getPrimaryCategories();
      if (res && Array.isArray(res.data)) {
        setRawCategories(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh mục gốc trên trang chủ:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrimaryCategories();
  }, [fetchPrimaryCategories]);

const PRIMARY_CATEGORY_ORDER: Record<string, number> = {
  'bong-da': 1,
  'cau-long': 2,
  'bong-ro': 3,
  'bong-chuyen': 4,
  'gym-chay-bo': 5,
  'vo-thuat': 6,
};

/**
 * Chuẩn hóa danh sách danh mục gốc thành cấu trúc hiển thị cho thẻ giao diện Trang chủ.
 */
  const categories: HomeCategoryCardItem[] = useMemo(() => {
    const sorted = [...rawCategories].sort((a, b) => {
      const orderA = PRIMARY_CATEGORY_ORDER[a.slug] ?? 999;
      const orderB = PRIMARY_CATEGORY_ORDER[b.slug] ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.id - b.id;
    });

    return sorted.map((cat) => {
      const fallback = SPORT_VISUAL_FALLBACKS[cat.slug] || {
        image: '/images/banners/sub_football_banner.png',
        badge: 'CHÍNH HÃNG',
        defaultDesc: 'Trang thiết bị và dụng cụ thể thao chuyên nghiệp chính hãng',
      };

      const count = cat.productCount ?? 0;

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        subtitle: cat.description || fallback.defaultDesc,
        image: cat.image || fallback.image,
        link: `/products?categoryId=${cat.id}`,
        countLabel: `${count} Sản phẩm`,
        badge: fallback.badge,
      };
    });
  }, [rawCategories]);

  return {
    categories,
    loading,
  };
}

