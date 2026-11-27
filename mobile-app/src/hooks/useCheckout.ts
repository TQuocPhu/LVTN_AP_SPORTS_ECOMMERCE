import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { appAlert } from '../context/AlertContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { addressController } from '../controllers/address-controller';
import { customerOrderController } from '../controllers/customer-order-controller';
import { voucherController } from '../controllers/voucher-controller';
import { locationController } from '../controllers/location-controller';
import {
  ShippingAddress,
  GhnProvince,
  GhnDistrict,
  GhnWard,
  Voucher,
  VoucherApplyResult,
  CheckoutVoucherTab,
  CheckoutEligibleVoucher,
  CheckoutIneligibleVoucher,
} from '../types';
import { useCart } from '../context/CartContext';
import { useKeyboardOffset } from './useKeyboardOffset';

export const useCheckout = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, totalAmount, clearCart } = useCart();
  const { scrollRef, keyboardHeight, scrollToEndOnFocus } = useKeyboardOffset();

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
  const [newCity, setNewCity] = useState<string>('');
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);

  // Dữ liệu địa giới hành chính GHN cho Modal thêm địa chỉ
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [loadingWards, setLoadingWards] = useState<boolean>(false);

  // Phí vận chuyển thực tế tính từ GHN API
  const [shippingFee, setShippingFee] = useState<number>(30000);
  const [loadingShippingFee, setLoadingShippingFee] = useState<boolean>(false);
  const discountAmount = appliedVoucher?.discountAmount || 0;
  const finalTotal = Math.max(0, totalAmount + shippingFee - discountAmount);

  // Tải danh sách Tỉnh/Thành phố GHN khi mở Modal thêm địa chỉ
  useEffect(() => {
    if (!isAddressModalVisible || provinces.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingProvinces(true);
        const res = await locationController.getProvinces();
        if (!cancelled) setProvinces(Array.isArray(res?.data) ? res.data : []);
      } catch {
        if (!cancelled) setProvinces([]);
      } finally {
        if (!cancelled) setLoadingProvinces(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAddressModalVisible, provinces.length]);

  // Tải Quận/Huyện GHN khi chọn Tỉnh/Thành
  useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingDistricts(true);
        const res = await locationController.getDistricts(selectedProvinceId);
        if (!cancelled) setDistricts(Array.isArray(res?.data) ? res.data : []);
      } catch {
        if (!cancelled) setDistricts([]);
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedProvinceId]);

  // Tải Phường/Xã GHN khi chọn Quận/Huyện
  useEffect(() => {
    if (!selectedDistrictId) {
      setWards([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingWards(true);
        const res = await locationController.getWards(selectedDistrictId);
        if (!cancelled) setWards(Array.isArray(res?.data) ? res.data : []);
      } catch {
        if (!cancelled) setWards([]);
      } finally {
        if (!cancelled) setLoadingWards(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDistrictId]);

  // Tự động tính phí giao hàng GHN khi selectedAddress hoặc totalAmount thay đổi (giống Web)
  useEffect(() => {
    if (!selectedAddress) {
      setShippingFee(30000);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingShippingFee(true);
      try {
        let targetDistrictId = selectedAddress.districtId;
        let targetWardCode = selectedAddress.wardCode;

        if (!targetDistrictId || !targetWardCode) {
          const provRes = await locationController.getProvinces();
          const provList = Array.isArray(provRes?.data) ? provRes.data : [];
          const cityLower = (selectedAddress.city || '').toLowerCase();
          const matchedProv = provList.find((p) =>
            cityLower.includes(p.ProvinceName.toLowerCase().replace(/tỉnh |thành phố /gi, '').trim())
          );
          if (matchedProv) {
            const distRes = await locationController.getDistricts(matchedProv.ProvinceID);
            const distList = Array.isArray(distRes?.data) ? distRes.data : [];
            const matchedDist = distList.find((d) =>
              cityLower.includes(d.DistrictName.toLowerCase().replace(/quận |huyện |thị xã |thành phố /gi, '').trim())
            );
            if (matchedDist) {
              targetDistrictId = matchedDist.DistrictID;
              const wardRes = await locationController.getWards(matchedDist.DistrictID);
              const wardList = Array.isArray(wardRes?.data) ? wardRes.data : [];
              const matchedWard = wardList.find((w) =>
                cityLower.includes(w.WardName.toLowerCase().replace(/phường |xã |thị trấn /gi, '').trim())
              );
              targetWardCode = matchedWard?.WardCode || wardList[0]?.WardCode;
            }
          }
        }

        if (targetDistrictId && targetWardCode) {
          const totalWeight = Math.max(
            500,
            items.reduce((sum, it) => sum + 500 * it.quantity, 0)
          );
          const feeRes = await locationController.calculateShippingFee(
            targetDistrictId,
            targetWardCode,
            totalWeight,
            totalAmount
          );
          const fee = feeRes?.data?.shippingFee;
          if (!cancelled && typeof fee === 'number') {
            setShippingFee(fee);
            return;
          }
        }
        if (!cancelled) setShippingFee(30000);
      } catch {
        if (!cancelled) setShippingFee(30000);
      } finally {
        if (!cancelled) setLoadingShippingFee(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedAddress, items, totalAmount]);

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

  const handleSelectProvince = useCallback((provinceId: number) => {
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId(null);
    setSelectedWardCode(null);
  }, []);

  const handleSelectDistrict = useCallback((districtId: number) => {
    setSelectedDistrictId(districtId);
    setSelectedWardCode(null);
  }, []);

  const handleCreateNewAddress = useCallback(async () => {
    if (!newFullName.trim() || !newPhone.trim() || !newAddressText.trim()) {
      appAlert('Thiếu thông tin', 'Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ chi tiết.');
      return;
    }

    const provinceObj = provinces.find((p) => p.ProvinceID === selectedProvinceId);
    const districtObj = districts.find((d) => d.DistrictID === selectedDistrictId);
    const wardObj = wards.find((w) => w.WardCode === selectedWardCode);

    if (!provinceObj || !districtObj || !wardObj) {
      appAlert(
        'Thiếu địa giới GHN',
        'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã để hệ thống tính phí giao hàng GHN.'
      );
      return;
    }

    const composedCity = `${wardObj.WardName}, ${districtObj.DistrictName}, ${provinceObj.ProvinceName}`;

    try {
      setIsAddingAddress(true);
      const res = await addressController.createAddress({
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        address: newAddressText.trim(),
        city: composedCity,
        provinceId: provinceObj.ProvinceID,
        districtId: districtObj.DistrictID,
        wardCode: wardObj.WardCode,
        isDefault: true,
      });

      const created = res.data;
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddress(created);
      setIsAddressModalVisible(false);
      setNewFullName('');
      setNewPhone('');
      setNewAddressText('');
      setNewCity('');
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
      setSelectedWardCode(null);
      appAlert('Thành công', 'Đã lưu địa chỉ giao hàng mới và cập nhật phí GHN.');
    } catch (err: any) {
      appAlert('Lỗi', err?.response?.data?.message || 'Không thể tạo địa chỉ, vui lòng thử lại.');
    } finally {
      setIsAddingAddress(false);
    }
  }, [
    newFullName,
    newPhone,
    newAddressText,
    provinces,
    districts,
    wards,
    selectedProvinceId,
    selectedDistrictId,
    selectedWardCode,
  ]);

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
      appAlert('Chưa có địa chỉ', 'Vui lòng chọn hoặc thêm địa chỉ nhận hàng để tiếp tục.');
      return;
    }

    if (items.length === 0) {
      appAlert('Giỏ hàng trống', 'Vui lòng chọn sản phẩm trước khi thanh toán.');
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
        shippingFee,
      });

      const order = res.data;
      clearCart();

      appAlert(
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
      appAlert('Đặt hàng thất bại', err?.response?.data?.message || err?.message || 'Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAddress, items, paymentMethod, couponCode, note, shippingFee, clearCart, navigation]);

  return {
    items,
    totalAmount,
    shippingFee,
    loadingShippingFee,
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
    provinces,
    districts,
    wards,
    selectedProvinceId,
    selectedDistrictId,
    selectedWardCode,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    handleSelectProvince,
    handleSelectDistrict,
    setSelectedWardCode,
    isAddingAddress,
    handleCreateNewAddress,
    handleConfirmOrder,
    scrollRef,
    keyboardHeight,
    scrollToEndOnFocus,
  };
};
