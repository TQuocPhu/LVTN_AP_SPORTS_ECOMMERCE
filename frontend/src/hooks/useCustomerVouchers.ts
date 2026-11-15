import { useState, useEffect, useCallback, useMemo } from 'react';
import { voucherController } from '@/controllers/voucher-controller';
import { Voucher } from '@/types/voucher';
import { toast } from 'sonner';

export type VoucherTypeFilter = 'ALL' | 'FIXED' | 'PERCENT' | 'FREESHIP';
export type VoucherMinOrderFilter = 'ALL' | 'NO_MIN' | 'UNDER_500K' | 'FROM_500K';
export type VoucherSortOption = 'DEFAULT' | 'EXPIRING_SOON' | 'MIN_ORDER_ASC' | 'VALUE_DESC';

/**
 * Custom Hook quản lý trạng thái Kho Voucher phía Khách hàng (/vouchers).
 * Bao gồm các tính năng: Lọc danh mục, lọc loại giảm giá, điều kiện đơn tối thiểu, sắp xếp, tìm kiếm nhanh mã, copy mã.
 */
export function useCustomerVouchers() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<VoucherTypeFilter>('ALL');
  const [selectedMinOrder, setSelectedMinOrder] = useState<VoucherMinOrderFilter>('ALL');
  const [onlyUsable, setOnlyUsable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<VoucherSortOption>('DEFAULT');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  /**
   * Tải danh sách voucher công khai từ backend dựa theo tab category được chọn.
   */
  const fetchPublicVouchers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await voucherController.getPublicVouchers(selectedCategory);
      if (res && res.data) {
        setVouchers(res.data);
      } else {
        setVouchers([]);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải kho voucher công khai:', error);
      // toast.error(error.message || 'Không thể tải danh sách mã giảm giá!');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPublicVouchers();
  }, [fetchPublicVouchers]);

  /**
   * Đổi tab phân loại voucher (ALL, FREESHIP, FASHION, APPAREL, SHOES).
   */
  const handleCategoryTabChange = (category: string) => {
    setSelectedCategory(category);
  };

  /**
   * Đổi từ khóa tìm kiếm nhanh trên giao diện khách hàng.
   */
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedMinOrder('ALL');
    setOnlyUsable(false);
    setSortBy('DEFAULT');
  };

  /**
   * Lọc & sắp xếp voucher trên giao diện client theo từ khóa, loại, đơn tối thiểu và trạng thái khả dụng.
   */
  const filteredVouchers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = vouchers.filter((v) => {
      if (q) {
        const matchText =
          v.code.toLowerCase().includes(q) ||
          v.name.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q));
        if (!matchText) return false;
      }

      if (selectedType !== 'ALL' && v.type?.toUpperCase() !== selectedType) {
        return false;
      }

      const minOrder = Number(v.minOrderValue || 0);
      if (selectedMinOrder === 'NO_MIN' && minOrder > 0) return false;
      if (selectedMinOrder === 'UNDER_500K' && minOrder >= 500000) return false;
      if (selectedMinOrder === 'FROM_500K' && minOrder < 500000) return false;

      if (onlyUsable) {
        const usableFlag = v.isUsable ?? (v as Voucher & { usable?: boolean }).usable ?? true;
        if (!usableFlag) return false;
      }

      return true;
    });

    if (sortBy === 'EXPIRING_SOON') {
      return [...list].sort((a, b) => {
        const ta = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        const tb = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
        return ta - tb;
      });
    }
    if (sortBy === 'MIN_ORDER_ASC') {
      return [...list].sort((a, b) => Number(a.minOrderValue || 0) - Number(b.minOrderValue || 0));
    }
    if (sortBy === 'VALUE_DESC') {
      return [...list].sort((a, b) => {
        const va = a.type === 'PERCENT' ? Number(a.maxDiscountAmount || a.value || 0) : Number(a.value || 0);
        const vb = b.type === 'PERCENT' ? Number(b.maxDiscountAmount || b.value || 0) : Number(b.value || 0);
        return vb - va;
      });
    }

    return list;
  }, [vouchers, searchQuery, selectedType, selectedMinOrder, onlyUsable, sortBy]);

  /**
   * Sao chép Mã Giảm Giá vào khay nhớ tạm (Clipboard) và thông báo Toast cho Khách hàng.
   *
   * @param code Mã giảm giá cần copy
   */
  const handleCopyCode = (code: string) => {
    if (!code) return;
    const cleanCode = code.trim();
    navigator.clipboard.writeText(cleanCode);
    setCopiedCode(cleanCode);
    // toast.success(`Đã sao chép mã [${cleanCode}] vào bộ nhớ tạm! 🎉`, {
    //   duration: 3000,
    // });

    // Reset trạng thái copied sau 3 giây
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  return {
    selectedCategory,
    searchQuery,
    selectedType,
    selectedMinOrder,
    onlyUsable,
    sortBy,
    vouchers: filteredVouchers,
    totalCount: vouchers.length,
    isLoading,
    copiedCode,
    handleCategoryTabChange,
    handleSearchQueryChange,
    setSelectedType,
    setSelectedMinOrder,
    setOnlyUsable,
    setSortBy,
    handleResetFilters,
    handleCopyCode,
    refresh: fetchPublicVouchers,
  };
}
