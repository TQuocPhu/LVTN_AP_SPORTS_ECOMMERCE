import { useState, useEffect, useCallback, useMemo } from 'react';
import { voucherController } from '@/controllers/voucher-controller';
import { Voucher } from '@/types/voucher';
import { toast } from 'sonner';

/**
 * Custom Hook quản lý trạng thái Kho Voucher phía Khách hàng (/vouchers).
 * Bao gồm các tính năng: Lọc danh mục (Tabs Shopee), tìm kiếm nhanh mã, copy mã vào bộ nhớ tạm.
 * Sử dụng thư viện 'sonner' chuẩn cho thông báo toast.
 */
export function useCustomerVouchers() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
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

  /**
   * Lọc voucher trên giao diện client theo từ khóa (Mã hoặc Tên voucher).
   */
  const filteredVouchers = useMemo(() => {
    if (!searchQuery.trim()) return vouchers;
    const q = searchQuery.trim().toLowerCase();
    return vouchers.filter(
      (v) =>
        v.code.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q))
    );
  }, [vouchers, searchQuery]);

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
    vouchers: filteredVouchers,
    totalCount: vouchers.length,
    isLoading,
    copiedCode,
    handleCategoryTabChange,
    handleSearchQueryChange,
    handleCopyCode,
    refresh: fetchPublicVouchers,
  };
}
