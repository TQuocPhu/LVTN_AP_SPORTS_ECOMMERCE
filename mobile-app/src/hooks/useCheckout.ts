import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { addressController } from '../controllers/address-controller';
import { customerOrderController } from '../controllers/customer-order-controller';
import { ShippingAddress } from '../types';
import { useCart } from '../context/CartContext';

export const useCheckout = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, totalAmount, clearCart } = useCart();

  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [couponCode, setCouponCode] = useState<string>('');
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
  const finalTotal = totalAmount + shippingFee;

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
    finalTotal,
    addresses,
    selectedAddress,
    setSelectedAddress,
    paymentMethod,
    setPaymentMethod,
    couponCode,
    setCouponCode,
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
