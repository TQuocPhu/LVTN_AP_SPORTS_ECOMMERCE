import { useState, useEffect, useCallback, useMemo } from 'react';
import { checkoutController } from '@/controllers/checkout-controller';
import { locationController } from '@/controllers/location-controller';
import { ShippingAddress, GhnProvince, GhnDistrict, GhnWard } from '@/types/address';
import { CartItem } from '@/types/cart';
import { PaymentMethod, CheckoutOrderSummary } from '@/types/checkout';
import { VoucherApplyResult } from '@/types/voucher';
import { toast } from 'sonner';

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
  handlePlaceOrder: () => Promise<void>;
}

/**
 * Custom Hook quản lý toàn bộ State & Business Logic cho Trang Đặt Hàng (/checkout).
 * Không chứa bất kỳ UI rendering code nào, tuân thủ Clean Architecture 4 tầng.
 */
export function useCheckout(): UseCheckoutReturn {
  // 1. State Địa Chỉ Giao Hàng
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddressState] = useState<ShippingAddress | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState<boolean>(false);

  // 2. State Phí Giao Hàng & Giỏ Hàng
  const [shippingFee, setShippingFee] = useState<number>(30000);
  const [loadingShippingFee, setLoadingShippingFee] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);

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

  // Load Giỏ hàng
  const fetchCart = useCallback(async () => {
    setLoadingCart(true);
    try {
      const res = await checkoutController.getCart();
      if (res.data) {
        setCartItems(res.data.items || []);
        setSubtotal(res.data.totalPrice || 0);
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
        setAppliedVoucher(res.data);
        const codeName = res.data.couponCode || res.data.voucher?.code || voucherCode;
        toast.success(`Áp dụng mã ${codeName} thành công!`);
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
    toast.info('Đã hủy áp dụng mã giảm giá.');
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

  // Tiến hành Đặt Hàng (Chuẩn bị Payload sẵn sàng cho bước xử lý Đặt hàng & Thanh toán ở phase sau)
  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      toast.error('Vui lòng chọn địa chỉ giao hàng trước khi tiến hành đặt hàng.');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      // Giả lập chuẩn bị đơn hàng cho Phase tiếp theo
      await new Promise((r) => setTimeout(r, 800));

      if (paymentMethod === 'VNPAY') {
        toast.info('Đã chuẩn bị thông tin đặt hàng. Đang chuyển sang cổng thanh toán VNPay...');
      } else {
        toast.success('Thông tin đặt hàng hợp lệ! Đã sẵn sàng cho bước xử lý đơn hàng COD.');
      }
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [selectedAddress, cartItems.length, paymentMethod]);

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
    handlePlaceOrder,
  };
}
