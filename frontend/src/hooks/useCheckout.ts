import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { checkoutController } from '@/controllers/checkout-controller';
import { locationController } from '@/controllers/location-controller';
import { orderController } from '@/controllers/order-controller';
import { ShippingAddress, GhnProvince, GhnDistrict, GhnWard } from '@/types/address';
import { CartItem } from '@/types/cart';
import { PaymentMethod, CheckoutOrderSummary } from '@/types/checkout';
import { VoucherApplyResult } from '@/types/voucher';
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
  handleApplyVoucher: () => Promise<void>;
  handleRemoveVoucher: () => void;

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
  const { selectedItems, selectedTotalPrice, items, totalPrice, refreshCart } = useCart();

  // 1. State Địa Chỉ Giao Hàng
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddressState] = useState<ShippingAddress | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState<boolean>(false);

  // 2. State Phí Giao Hàng & Giỏ Hàng
  const [shippingFee, setShippingFee] = useState<number>(30000);
  const [loadingShippingFee, setLoadingShippingFee] = useState<boolean>(false);
  const [rawCartItems, setRawCartItems] = useState<CartItem[]>([]);
  const [rawSubtotal, setRawSubtotal] = useState<number>(0);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);

  // Lọc sản phẩm được chọn từ giỏ hàng (Ưu tiên selectedItems từ CartContext)
  const cartItems = useMemo(() => {
    if (selectedItems && selectedItems.length > 0) {
      return selectedItems;
    }
    if (rawCartItems && rawCartItems.length > 0) {
      return rawCartItems;
    }
    return items || [];
  }, [selectedItems, rawCartItems, items]);

  const subtotal = useMemo(() => {
    if (selectedItems && selectedItems.length > 0) {
      return selectedTotalPrice;
    }
    if (rawSubtotal > 0) {
      return rawSubtotal;
    }
    return totalPrice || 0;
  }, [selectedItems, selectedTotalPrice, rawSubtotal, totalPrice]);

  // 3. State Phương Thức Thanh Toán (Mặc định COD)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  // 4. State Voucher
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherApplyResult | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState<boolean>(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

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
          const feeRes = await locationController.calculateShippingFee(targetDistrictId, targetWardCode);
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
  }, [selectedAddress]);

  // Load Giỏ hàng từ Backend nếu cần
  const fetchCart = useCallback(async () => {
    setLoadingCart(true);
    try {
      const res = await checkoutController.getCart();
      if (res.data) {
        setRawCartItems(res.data.items || []);
        setRawSubtotal(res.data.totalPrice || 0);
      }
    } catch {
      // Silent catch
    } finally {
      setLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
    fetchCart();
  }, [fetchAddresses, fetchCart]);

  // Chọn địa chỉ từ Modal
  const setSelectedAddress = useCallback((addr: ShippingAddress) => {
    setSelectedAddressState(addr);
    setIsAddressSelectModalOpen(false);
  }, []);

  // Áp dụng Voucher
  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá.');
      return;
    }
    setApplyingVoucher(true);
    setVoucherError(null);
    try {
      const res = await checkoutController.applyVoucher({
        code: voucherCode.trim().toUpperCase(),
        orderAmount: subtotal,
        shippingFee: shippingFee,
      });
      if (res.data) {
        if (res.data.valid) {
          setAppliedVoucher(res.data);
          setVoucherError(null);
        } else {
          setVoucherError(res.data.message || 'Mã giảm giá không hợp lệ.');
          setAppliedVoucher(null);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể áp dụng mã giảm giá này.';
      setVoucherError(msg);
      setAppliedVoucher(null);
    } finally {
      setApplyingVoucher(false);
    }
  }, [voucherCode, subtotal, shippingFee]);

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
        cartItemIds: selectedCartItemIds,
      };

      const res = await orderController.createOrder(payload);

      if (res.data) {
        // Cập nhật ngay lập tức state giỏ hàng trên UI
        await refreshCart();

        if (paymentMethod === 'VNPAY' && res.data.paymentUrl) {
          window.location.href = res.data.paymentUrl;
        } else {
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

  return {
    addresses,
    selectedAddress,
    loadingAddresses,
    loadingShippingFee,
    isAddressSelectModalOpen,
    setIsAddressSelectModalOpen,
    setSelectedAddress,
    refetchAddresses: fetchAddresses,
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
    note,
    setNote,
    summary,
    isSubmittingOrder,
    orderError,
    handlePlaceOrder,
  };
}
