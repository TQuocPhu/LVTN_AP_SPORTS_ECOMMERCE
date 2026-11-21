import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { addressController } from '../controllers/address-controller';
import { customerOrderController } from '../controllers/customer-order-controller';
import { voucherController } from '../controllers/voucher-controller';
import {
  ShippingAddress,
  Voucher,
  VoucherApplyResult,
  CheckoutVoucherTab,
  CheckoutEligibleVoucher,
  CheckoutIneligibleVoucher,
} from '../types';
import { useCart } from '../context/CartContext';

export const useCheckout = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, totalAmount, clearCart } = useCart();

  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherApplyResult | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState<boolean>(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isVoucherModalVisible, setIsVoucherModalVisible] = useState<boolean>(false);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState<boolean>(false);
  const [hasLoadedVouchers, setHasLoadedVouchers] = useState<boolean>(false);
  const [voucherSearchQuery, setVoucherSearchQuery] = useState<string>('');
  const [voucherTabFilter, setVoucherTabFilter] = useState<CheckoutVoucherTab>('ALL');
  const [voucherModalError, setVoucherModalError] = useState<string | null>(null);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingAddress, setLoadingAddress] = useState<boolean>(true);

  // Modal thêm địa chỉ mới
  const [isAddressModalVisible, setIsAddressModalVisible] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newAddressText, setNewAddressText] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('Hồ Chí Minh');
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);

  // Phí vận chuyển (Miễn phí nếu đơn >= 500,000 VND)
  const shippingFee = totalAmount >= 500000 ? 0 : 30000;
  const discountAmount = appliedVoucher?.discountAmount || 0;
  const finalTotal = Math.max(0, totalAmount + shippingFee - discountAmount);

  const loadAddresses = useCallback(async () => {
    try {
      setLoadingAddress(true);
      const res = await addressController.getAddresses();
      const list = res.data || [];
      setAddresses(list);
      if (list.length > 0) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddress(defaultAddr);
      }
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleCreateNewAddress = useCallback(async () => {
    if (!newFullName.trim() || !newPhone.trim() || !newAddressText.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ giao hàng.');
      return;
    }

    try {
      setIsAddingAddress(true);
      const res = await addressController.createAddress({
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        address: newAddressText.trim(),
        city: newCity,
        isDefault: true,
      });

      const created = res.data;
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddress(created);
      setIsAddressModalVisible(false);
      setNewFullName('');
      setNewPhone('');
      setNewAddressText('');
      Alert.alert('Thành công', 'Đã lưu địa chỉ giao hàng mới.');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể tạo địa chỉ, vui lòng thử lại.');
    } finally {
      setIsAddingAddress(false);
    }
  }, [newFullName, newPhone, newAddressText, newCity]);

  // Lazy-load danh sách voucher khi người dùng mở Modal chọn Voucher
  const loadAvailableVouchers = useCallback(
    async (force = false) => {
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
    },
    [hasLoadedVouchers]
  );

  const handleOpenVoucherModal = useCallback(() => {
    setVoucherModalError(null);
    setIsVoucherModalVisible(true);
    loadAvailableVouchers(false);
  }, [loadAvailableVouchers]);

  const handleCloseVoucherModal = useCallback(() => {
    setIsVoucherModalVisible(false);
    setVoucherModalError(null);
  }, []);

  const handleRefreshVouchers = useCallback(() => {
    loadAvailableVouchers(true);
  }, [loadAvailableVouchers]);

  // Phân loại & sắp xếp Voucher thành 2 nhóm: Đủ điều kiện vs Chưa đủ điều kiện
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
        reason = 'Chưa đến thời gian áp dụng';
      } else if (expiresAtMs && !Number.isNaN(expiresAtMs) && nowMs > expiresAtMs) {
        reason = 'Mã khuyến mãi đã hết hạn sử dụng';
      } else if (outOfSystemQuota) {
        reason = 'Mã đã hết lượt sử dụng trên toàn hệ thống';
      } else if (outOfUserQuota) {
        reason = `Bạn đã dùng hết ${v.userUsageLimit ?? v.userUsedCount ?? 1} lượt cho mã này`;
      } else if (totalAmount < minOrder) {
        missingAmount = Math.max(0, minOrder - totalAmount);
        progressPercent = minOrder > 0 ? Math.min(99, Math.round((totalAmount / minOrder) * 100)) : 0;
        reason = `Mua thêm ${missingAmount.toLocaleString('vi-VN')} đ để áp dụng`;
      }

      if (reason) {
        ineligible.push({ voucher: v, reason, missingAmount, progressPercent });
      } else {
        let estimatedDiscount = 0;
        if (vType === 'FIXED') {
          estimatedDiscount = Math.min(totalAmount, Number(v.value || 0));
        } else if (vType === 'PERCENT') {
          const raw = Math.round((totalAmount * Number(v.value || 0)) / 100);
          const maxCap = Number(v.maxDiscountAmount || 0);
          estimatedDiscount = maxCap > 0 ? Math.min(raw, maxCap, totalAmount) : Math.min(raw, totalAmount);
        } else if (vType === 'FREESHIP') {
          const cap = Number(v.maxDiscountAmount || v.value || 0);
          estimatedDiscount = cap > 0 ? Math.min(shippingFee, cap) : shippingFee;
        }
        eligible.push({ voucher: v, estimatedDiscount, isBestChoice: false });
      }
    }

    eligible.sort((a, b) => b.estimatedDiscount - a.estimatedDiscount);
    if (eligible.length > 0 && eligible[0].estimatedDiscount > 0) {
      eligible[0].isBestChoice = true;
    }
    ineligible.sort((a, b) => b.progressPercent - a.progressPercent);

    return { eligibleVouchers: eligible, ineligibleVouchers: ineligible };
  }, [availableVouchers, voucherSearchQuery, voucherTabFilter, totalAmount, shippingFee]);

  const handleApplyVoucher = useCallback(
    async (overrideCode?: string): Promise<boolean> => {
      const targetCode = (typeof overrideCode === 'string' ? overrideCode : couponCode).trim().toUpperCase();
      if (!targetCode) {
        setVoucherError('Vui lòng nhập mã giảm giá.');
        return false;
      }
      if (typeof overrideCode === 'string') {
        setCouponCode(targetCode);
      }
      setApplyingVoucher(true);
      setVoucherError(null);
      setVoucherModalError(null);
      try {
        const res = await voucherController.applyVoucher({
          code: targetCode,
          orderAmount: totalAmount,
          shippingFee,
        });
        if (res.data?.valid) {
          setAppliedVoucher(res.data);
          setVoucherError(null);
          return true;
        } else {
          const errMsg = res.data?.message || 'Mã giảm giá không hợp lệ.';
          setVoucherError(errMsg);
          setVoucherModalError(errMsg);
          setAppliedVoucher(null);
          return false;
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Không thể áp dụng mã giảm giá này.';
        setVoucherError(msg);
        setVoucherModalError(msg);
        setAppliedVoucher(null);
        return false;
      } finally {
        setApplyingVoucher(false);
      }
    },
    [couponCode, totalAmount, shippingFee]
  );

  const handleRemoveVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setCouponCode('');
    setVoucherError(null);
  }, []);

  const handleSelectVoucherFromModal = useCallback(
    async (code: string) => {
      const ok = await handleApplyVoucher(code);
      if (ok) {
        setIsVoucherModalVisible(false);
      }
    },
    [handleApplyVoucher]
  );

  // Tự đồng bộ lại voucher khi shippingFee hoặc totalAmount thay đổi
  useEffect(() => {
    const activeCode = appliedVoucher?.couponCode || appliedVoucher?.voucher?.code;
    if (!activeCode) return;

    let cancelled = false;
    voucherController
      .applyVoucher({ code: activeCode, orderAmount: totalAmount, shippingFee })
      .then((res) => {
        if (cancelled) return;
        if (res.data?.valid) {
          setAppliedVoucher(res.data);
          setVoucherError(null);
        } else {
          setAppliedVoucher(null);
          setVoucherError(res.data?.message || 'Mã giảm giá không còn phù hợp.');
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [shippingFee, totalAmount]);

  const handleConfirmOrder = useCallback(async () => {
    if (!selectedAddress) {
      Alert.alert('Chưa có địa chỉ', 'Vui lòng chọn hoặc thêm địa chỉ nhận hàng để tiếp tục.');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn sản phẩm trước khi thanh toán.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await customerOrderController.syncAndCreateOrder({
        items,
        shippingAddressId: selectedAddress.id,
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
        note: note.trim() || undefined,
      });

      const order = res.data;
      clearCart();

      Alert.alert(
        'Đặt hàng thành công! 🎉',
        `Mã đơn hàng: #${order.orderCode}\nAP Sports sẽ xử lý và giao hàng sớm nhất cho bạn.`,
        [
          {
            text: 'Xem chi tiết đơn',
            onPress: () => {
              navigation.replace('OrderDetail', {
                orderId: order.id,
                orderCode: order.orderCode,
              });
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Đặt hàng thất bại', err?.response?.data?.message || err?.message || 'Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAddress, items, paymentMethod, couponCode, note, clearCart, navigation]);

  return {
    items,
    totalAmount,
    shippingFee,
    discountAmount,
    finalTotal,
    addresses,
    selectedAddress,
    setSelectedAddress,
    paymentMethod,
    setPaymentMethod,
    couponCode,
    setCouponCode,
    appliedVoucher,
    applyingVoucher,
    voucherError,
    isVoucherModalVisible,
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
    handleApplyVoucher,
    handleRemoveVoucher,
    handleSelectVoucherFromModal,
    note,
    setNote,
    isSubmitting,
    loadingAddress,
    isAddressModalVisible,
    setIsAddressModalVisible,
    newFullName,
    setNewFullName,
    newPhone,
    setNewPhone,
    newAddressText,
    setNewAddressText,
    newCity,
    setNewCity,
    isAddingAddress,
    handleCreateNewAddress,
    handleConfirmOrder,
  };
};
