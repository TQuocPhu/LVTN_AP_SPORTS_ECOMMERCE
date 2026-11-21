import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { checkoutController } from '@/controllers/checkout-controller';
import { voucherController } from '@/controllers/voucher-controller';
import { locationController } from '@/controllers/location-controller';
import { orderController } from '@/controllers/order-controller';
import { ShippingAddress, ShippingAddressRequest, GhnProvince, GhnDistrict, GhnWard } from '@/types/address';
import { addressController } from '@/controllers/address-controller';
import { CartItem } from '@/types/cart';
import { PaymentMethod, CheckoutOrderSummary } from '@/types/checkout';
import {
  Voucher,
  VoucherApplyResult,
  CheckoutVoucherTab,
  CheckoutEligibleVoucher,
  CheckoutIneligibleVoucher,
} from '@/types/voucher';

export interface UseCheckoutReturn {
  // Address State
  addresses: ShippingAddress[];
  selectedAddress: ShippingAddress | null;
  loadingAddresses: boolean;
  loadingShippingFee: boolean;
  isAddressSelectModalOpen: boolean;
  setIsAddressSelectModalOpen: (open: boolean) => void;
  setSelectedAddress: (address: ShippingAddress) => void;
  refetchAddresses: () => Promise<void>;
  handleAddAddress: (data: ShippingAddressRequest) => Promise<boolean>;

  // Cart Items State
  cartItems: CartItem[];
  subtotal: number;
  loadingCart: boolean;

  // Payment Method
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;

  // Voucher State
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  appliedVoucher: VoucherApplyResult | null;
  applyingVoucher: boolean;
  voucherError: string | null;
  handleApplyVoucher: (overrideCode?: string) => Promise<boolean>;
  handleRemoveVoucher: () => void;

  // Voucher Modal State
  isVoucherModalOpen: boolean;
  loadingVouchers: boolean;
  voucherSearchQuery: string;
  setVoucherSearchQuery: (q: string) => void;
  voucherTabFilter: CheckoutVoucherTab;
  setVoucherTabFilter: (tab: CheckoutVoucherTab) => void;
  voucherModalError: string | null;
  eligibleVouchers: CheckoutEligibleVoucher[];
  ineligibleVouchers: CheckoutIneligibleVoucher[];
  handleOpenVoucherModal: () => void;
  handleCloseVoucherModal: () => void;
  handleRefreshVouchers: () => void;
  handleSelectVoucherFromModal: (code: string) => Promise<void>;

  // Note State
  note: string;
  setNote: (note: string) => void;

  // Order Calculations
  summary: CheckoutOrderSummary;

  // Order Submission
  isSubmittingOrder: boolean;
  orderError: string | null;
  handlePlaceOrder: () => Promise<void>;
}

/**
 * Custom Hook quản lý toàn bộ State & Business Logic cho Trang Đặt Hàng (/checkout).
 * Không chứa bất kỳ UI rendering code nào, tuân thủ Clean Architecture 4 tầng.
 */
export function useCheckout(): UseCheckoutReturn {
  const router = useRouter();
  const { selectedItems, selectedTotalPrice, isLoading: loadingCart, refreshCart } = useCart();

  // 1. State Địa Chỉ Giao Hàng
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddressState] = useState<ShippingAddress | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState<boolean>(false);

  // 2. State Phí Giao Hàng & Giỏ Hàng
  const [shippingFee, setShippingFee] = useState<number>(30000);
  const [loadingShippingFee, setLoadingShippingFee] = useState<boolean>(false);

  // Lọc sản phẩm được chọn từ giỏ hàng (Chỉ lấy các sản phẩm ĐƯỢC CHỌN từ CartContext)
  const cartItems = useMemo(() => {
    return selectedItems || [];
  }, [selectedItems]);

  const subtotal = useMemo(() => {
    return selectedTotalPrice || 0;
  }, [selectedTotalPrice]);

  // 3. State Phương Thức Thanh Toán (Mặc định COD)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  // 4. State Voucher & Modal chọn Voucher
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherApplyResult | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState<boolean>(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState<boolean>(false);
  const [hasLoadedVouchers, setHasLoadedVouchers] = useState<boolean>(false);
  const [voucherSearchQuery, setVoucherSearchQuery] = useState<string>('');
  const [voucherTabFilter, setVoucherTabFilter] = useState<CheckoutVoucherTab>('ALL');
  const [voucherModalError, setVoucherModalError] = useState<string | null>(null);

  // 5. State Ghi Chú & Submitting
  const [note, setNote] = useState<string>('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Load danh sách Địa chỉ khách hàng
  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const res = await checkoutController.getAddresses();
      const list = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? (res as unknown as ShippingAddress[]) : []);
      setAddresses(list);
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault || a.default) || list[0];
        setSelectedAddressState(defaultAddr);
      }
    } catch {
      // Silent catch
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  // Tự động tính Phí Giao Hàng GHN khi selectedAddress thay đổi
  useEffect(() => {
    if (!selectedAddress) {
      setShippingFee(30000);
      return;
    }

    let isCancelled = false;

    async function computeGhnShippingFee() {
      setLoadingShippingFee(true);
      let targetDistrictId = selectedAddress?.districtId;
      let targetWardCode = selectedAddress?.wardCode;

      // Nếu địa chỉ chưa có districtId / wardCode, tự động đối soát mở rộng với dữ liệu GHN
      if (!targetDistrictId || !targetWardCode) {
        try {
          const provRes = await locationController.getProvinces();
          const provList = (provRes?.data || provRes || []) as GhnProvince[];
          const fullTextLower = `${selectedAddress?.address || ''}, ${selectedAddress?.city || ''}`.toLowerCase();

          const matchedProv = provList.find((p) => fullTextLower.includes(p.ProvinceName.toLowerCase()));
          if (matchedProv) {
            const distRes = await locationController.getDistricts(matchedProv.ProvinceID);
            const distList = (distRes?.data || distRes || []) as GhnDistrict[];

            for (const d of distList) {
              if (fullTextLower.includes(d.DistrictName.toLowerCase())) {
                targetDistrictId = d.DistrictID;
                const wardRes = await locationController.getWards(d.DistrictID);
                const wardList = (wardRes?.data || wardRes || []) as GhnWard[];
                const matchedWard = wardList.find((w) => fullTextLower.includes(w.WardName.toLowerCase()));
                if (matchedWard) {
                  targetWardCode = matchedWard.WardCode;
                }
                break;
              }
            }
          }
        } catch {
          // Silent catch
        }
      }

      if (targetDistrictId && targetWardCode) {
        try {
          // Tính tổng trọng lượng (grams) các sản phẩm ĐƯỢC CHỌN trong giỏ hàng
          const totalWeight = cartItems.reduce((sum, item) => {
            const w = (typeof item.weight === 'number' && item.weight > 0) ? item.weight : 500;
            return sum + w * (item.quantity || 1);
          }, 0) || 500;

          const feeRes = await locationController.calculateShippingFee(targetDistrictId, targetWardCode, totalWeight, subtotal);
          const fee = feeRes?.data?.shippingFee;
          if (!isCancelled && typeof fee === 'number') {
            setShippingFee(fee);
            setLoadingShippingFee(false);
            return;
          }
        } catch {
          // Fallback
        }
      }

      if (!isCancelled) {
        setShippingFee(30000); // Fallback phí tiêu chuẩn 30.000đ
        setLoadingShippingFee(false);
      }
    }

    computeGhnShippingFee();

    return () => {
      isCancelled = true;
    };
  }, [selectedAddress, cartItems]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Reset trạng thái đang gửi đơn nếu người dùng bấm Back từ cổng thanh toán VNPay (BFCache)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePageShow = () => {
      setIsSubmittingOrder(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Chọn địa chỉ từ Modal
  const setSelectedAddress = useCallback((addr: ShippingAddress) => {
    setSelectedAddressState(addr);
    setIsAddressSelectModalOpen(false);
  }, []);

  // Tải danh sách Voucher công khai kèm lượt dùng cá nhân (Lazy-load khi mở Modal)
  const loadAvailableVouchers = useCallback(async (force = false) => {
    if (!force && hasLoadedVouchers) return;
    setLoadingVouchers(true);
    setVoucherModalError(null);
    try {
      const res = await voucherController.getPublicVouchers('ALL');
      if (res && Array.isArray(res.data)) {
        setAvailableVouchers(res.data);
        setHasLoadedVouchers(true);
      } else {
        setAvailableVouchers([]);
      }
    } catch {
      setVoucherModalError('Không thể tải danh sách mã khuyến mãi. Vui lòng thử lại.');
    } finally {
      setLoadingVouchers(false);
    }
  }, [hasLoadedVouchers]);

  const handleOpenVoucherModal = useCallback(() => {
    setVoucherModalError(null);
    setIsVoucherModalOpen(true);
    loadAvailableVouchers(false);
  }, [loadAvailableVouchers]);

  const handleCloseVoucherModal = useCallback(() => {
    setIsVoucherModalOpen(false);
    setVoucherModalError(null);
  }, []);

  const handleRefreshVouchers = useCallback(() => {
    loadAvailableVouchers(true);
  }, [loadAvailableVouchers]);

  // Phân loại và sắp xếp Voucher thành 2 nhóm: Đủ điều kiện vs Chưa đủ điều kiện
  const { eligibleVouchers, ineligibleVouchers } = useMemo(() => {
    const eligible: CheckoutEligibleVoucher[] = [];
    const ineligible: CheckoutIneligibleVoucher[] = [];
    const nowMs = Date.now();
    const q = voucherSearchQuery.trim().toLowerCase();

    for (const v of availableVouchers) {
      if (q) {
        const match =
          v.code.toLowerCase().includes(q) ||
          v.name.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q));
        if (!match) continue;
      }

      const vType = (v.type || '').toUpperCase();
      if (voucherTabFilter === 'FREESHIP' && vType !== 'FREESHIP') continue;
      if (voucherTabFilter === 'DISCOUNT' && vType === 'FREESHIP') continue;

      const minOrder = Number(v.minOrderValue || 0);
      const startsAtMs = v.startsAt ? new Date(v.startsAt).getTime() : null;
      const expiresAtMs = v.expiresAt ? new Date(v.expiresAt).getTime() : null;
      const activeFlag = v.isActive ?? v.active ?? true;
      const outOfSystemQuota = v.usageLimit != null && v.usedCount >= v.usageLimit;
      const outOfUserQuota = v.remainingUserUses != null && v.remainingUserUses <= 0;

      let reason: string | null = null;
      let missingAmount = 0;
      let progressPercent = 100;

      if (!activeFlag) {
        reason = 'Mã khuyến mãi đang tạm dừng';
      } else if (startsAtMs && !Number.isNaN(startsAtMs) && nowMs < startsAtMs) {
        const startLabel = new Date(startsAtMs).toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        });
        reason = `Chưa đến giờ mở (từ ${startLabel})`;
      } else if (expiresAtMs && !Number.isNaN(expiresAtMs) && nowMs > expiresAtMs) {
        reason = 'Mã khuyến mãi đã hết hạn sử dụng';
      } else if (outOfSystemQuota) {
        reason = 'Mã đã hết lượt sử dụng trên toàn hệ thống';
      } else if (outOfUserQuota) {
        reason = `Bạn đã dùng hết ${v.userUsageLimit ?? v.userUsedCount ?? 1} lượt cho mã này`;
      } else if (subtotal < minOrder) {
        missingAmount = Math.max(0, minOrder - subtotal);
        progressPercent = minOrder > 0 ? Math.min(99, Math.round((subtotal / minOrder) * 100)) : 0;
        reason = `Mua thêm ${missingAmount.toLocaleString('vi-VN')} đ để áp dụng`;
      }

      if (reason) {
        ineligible.push({
          voucher: v,
          reason,
          missingAmount,
          progressPercent,
        });
      } else {
        // Ước tính số tiền được giảm để sắp xếp mã lợi nhất lên đầu
        let estimatedDiscount = 0;
        if (vType === 'FIXED') {
          estimatedDiscount = Math.min(subtotal, Number(v.value || 0));
        } else if (vType === 'PERCENT') {
          const raw = Math.round((subtotal * Number(v.value || 0)) / 100);
          const maxCap = Number(v.maxDiscountAmount || 0);
          estimatedDiscount = maxCap > 0 ? Math.min(raw, maxCap, subtotal) : Math.min(raw, subtotal);
        } else if (vType === 'FREESHIP') {
          const cap = Number(v.maxDiscountAmount || v.value || 0);
          estimatedDiscount = cap > 0 ? Math.min(shippingFee, cap) : shippingFee;
        }
        eligible.push({
          voucher: v,
          estimatedDiscount,
          isBestChoice: false,
        });
      }
    }

    eligible.sort((a, b) => b.estimatedDiscount - a.estimatedDiscount);
    if (eligible.length > 0 && eligible[0].estimatedDiscount > 0) {
      eligible[0].isBestChoice = true;
    }

    // Đưa mã sắp đủ điều kiện (progressPercent cao) lên đầu nhóm chưa đủ điều kiện
    ineligible.sort((a, b) => b.progressPercent - a.progressPercent);

    return { eligibleVouchers: eligible, ineligibleVouchers: ineligible };
  }, [availableVouchers, voucherSearchQuery, voucherTabFilter, subtotal, shippingFee]);

  // Áp dụng Voucher (hỗ trợ nhập tay hoặc chọn trực tiếp từ Modal)
  const handleApplyVoucher = useCallback(
    async (overrideCode?: string): Promise<boolean> => {
      const targetCode = (typeof overrideCode === 'string' ? overrideCode : voucherCode).trim().toUpperCase();
      if (!targetCode) {
        setVoucherError('Vui lòng nhập mã giảm giá.');
        return false;
      }
      if (typeof overrideCode === 'string') {
        setVoucherCode(targetCode);
      }
      setApplyingVoucher(true);
      setVoucherError(null);
      setVoucherModalError(null);
      try {
        const res = await checkoutController.applyVoucher({
          code: targetCode,
          orderAmount: subtotal,
          shippingFee: shippingFee,
        });
        if (res.data) {
          if (res.data.valid) {
            setAppliedVoucher(res.data);
            setVoucherError(null);
            return true;
          } else {
            const errMsg = res.data.message || 'Mã giảm giá không hợp lệ.';
            setVoucherError(errMsg);
            setVoucherModalError(errMsg);
            setAppliedVoucher(null);
            return false;
          }
        }
        return false;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể áp dụng mã giảm giá này.';
        setVoucherError(msg);
        setVoucherModalError(msg);
        setAppliedVoucher(null);
        return false;
      } finally {
        setApplyingVoucher(false);
      }
    },
    [voucherCode, subtotal, shippingFee]
  );

  // Chọn 1 click từ Modal Voucher -> gọi Backend xác thực & đóng modal nếu hợp lệ
  const handleSelectVoucherFromModal = useCallback(
    async (code: string) => {
      const ok = await handleApplyVoucher(code);
      if (ok) {
        setIsVoucherModalOpen(false);
      }
    },
    [handleApplyVoucher]
  );

  // Tự động đồng bộ lại mức giảm voucher (đặc biệt FREESHIP) khi shippingFee hoặc subtotal thay đổi
  useEffect(() => {
    const activeCode = appliedVoucher?.couponCode || appliedVoucher?.voucher?.code;
    if (!activeCode) return;

    let cancelled = false;
    checkoutController
      .applyVoucher({
        code: activeCode,
        orderAmount: subtotal,
        shippingFee: shippingFee,
      })
      .then((res) => {
        if (cancelled) return;
        if (res?.data?.valid) {
          setAppliedVoucher(res.data);
          setVoucherError(null);
        } else {
          setAppliedVoucher(null);
          setVoucherError(res?.data?.message || 'Mã giảm giá không còn phù hợp với đơn hàng hiện tại.');
        }
      })
      .catch(() => {
        // Giữ nguyên nếu lỗi mạng tạm thời
      });

    return () => {
      cancelled = true;
    };
  }, [shippingFee, subtotal]);

  // Gỡ bỏ Voucher
  const handleRemoveVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError(null);
  }, []);

  // Tính toán Tổng quan Đơn hàng
  const summary: CheckoutOrderSummary = useMemo(() => {
    const discountAmount = appliedVoucher?.discountAmount || 0;
    const finalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

    return {
      subtotal,
      shippingFee,
      discountAmount,
      finalAmount,
    };
  }, [subtotal, shippingFee, appliedVoucher]);

  // Tiến hành Đặt Hàng (Gửi API Tạo đơn hàng & Xử lý thanh toán COD / VNPay)
  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      setOrderError('Vui lòng chọn địa chỉ giao hàng trước khi tiến hành đặt hàng.');
      return;
    }
    if (cartItems.length === 0) {
      setOrderError('Giỏ hàng của bạn đang trống.');
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);
    try {
      const selectedCartItemIds = cartItems.map((item) => item.id);
      const payload = {
        shippingAddressId: selectedAddress.id,
        paymentMethod: paymentMethod,
        couponCode: appliedVoucher?.couponCode || appliedVoucher?.voucher?.code || (voucherCode.trim() ? voucherCode.trim() : undefined),
        note: note.trim() || undefined,
        shippingFee: shippingFee,
        cartItemIds: selectedCartItemIds,
      };

      const res = await orderController.createOrder(payload);

      if (res.data) {
        if (paymentMethod === "VNPAY" && res.data.paymentUrl) {
          // Giữ nguyên giỏ hàng khi chuyển sang VNPay; chỉ xóa khi thanh toán thành công
          window.location.href = res.data.paymentUrl;
        } else {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("ap_selected_cart_item_ids");
          }
          await refreshCart();
          router.push(`/orders/success?code=${res.data.orderCode}`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đặt hàng không thành công. Vui lòng thử lại.';
      setOrderError(msg);
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [selectedAddress, cartItems, paymentMethod, appliedVoucher, voucherCode, note, refreshCart, router]);

  // Tạo địa chỉ giao hàng mới
  const handleAddAddress = useCallback(
    async (data: ShippingAddressRequest): Promise<boolean> => {
      try {
        const res = await addressController.createAddress(data);
        if (res.data) {
          await fetchAddresses();
          setSelectedAddressState(res.data);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [fetchAddresses],
  );

  return {
    addresses,
    selectedAddress,
    loadingAddresses,
    loadingShippingFee,
    isAddressSelectModalOpen,
    setIsAddressSelectModalOpen,
    setSelectedAddress,
    refetchAddresses: fetchAddresses,
    handleAddAddress,
    cartItems,
    subtotal,
    loadingCart,
    paymentMethod,
    setPaymentMethod,
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    applyingVoucher,
    voucherError,
    handleApplyVoucher,
    handleRemoveVoucher,
    isVoucherModalOpen,
    loadingVouchers,
    voucherSearchQuery,
    setVoucherSearchQuery,
    voucherTabFilter,
    setVoucherTabFilter,
    voucherModalError,
    eligibleVouchers,
    ineligibleVouchers,
    handleOpenVoucherModal,
    handleCloseVoucherModal,
    handleRefreshVouchers,
    handleSelectVoucherFromModal,
    note,
    setNote,
    summary,
    isSubmittingOrder,
    orderError,
    handlePlaceOrder,
  };
}
