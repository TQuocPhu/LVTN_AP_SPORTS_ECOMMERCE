import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { appAlert } from '../context/AlertContext';
import { profileController, UserProfileData } from '../controllers/profile-controller';
import { addressController } from '../controllers/address-controller';
import { locationController } from '../controllers/location-controller';
import { GhnDistrict, GhnProvince, GhnWard, ShippingAddress } from '../types';
import { useKeyboardOffset } from './useKeyboardOffset';

export type ProfileTab = 'info' | 'addresses' | 'password';

export const useProfileManagement = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, refreshUser, logout } = useAuth();
  const { scrollRef, keyboardHeight, scrollToEndOnFocus } = useKeyboardOffset();

  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  // Tab 1: Thông tin cá nhân
  const [name, setName] = useState<string>(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phone || '');
  const [address, setAddress] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);

  // Tab 2: Sổ địa chỉ GHN
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newAddressText, setNewAddressText] = useState<string>('');
  const [isAddingAddress, setIsAddingAddress] = useState<boolean>(false);

  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);
  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [loadingWards, setLoadingWards] = useState<boolean>(false);

  // Tab 3: Đổi mật khẩu
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  const isGoogleAccount = Boolean(profile?.googleAccount || profile?.googleId || user?.googleAccount || user?.googleId);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingAddresses(true);
      const [profRes, addrRes] = await Promise.all([
        profileController.getProfile(),
        addressController.getAddresses(),
      ]);
      const p = profRes.data;
      setProfile(p);
      setName(p.name || '');
      setPhoneNumber(p.phoneNumber || '');
      setAddress(p.address || '');
      setAddresses(Array.isArray(addrRes.data) ? addrRes.data : []);
    } catch (err: any) {
      appAlert('Lỗi', err?.response?.data?.message || 'Không thể tải thông tin hồ sơ cá nhân.');
    } finally {
      setLoading(false);
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load GHN Provinces khi mở modal thêm địa chỉ
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

  const handleSaveProfile = useCallback(async () => {
    if (!name.trim()) {
      appAlert('Thiếu thông tin', 'Họ và tên không được để trống.');
      return;
    }
    try {
      setSavingProfile(true);
      const res = await profileController.updateProfile({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });
      setProfile(res.data);
      await refreshUser();
      appAlert('Thành công', 'Đã cập nhật thông tin cá nhân.');
    } catch (err: any) {
      appAlert('Lỗi', err?.response?.data?.message || 'Không thể cập nhật thông tin cá nhân.');
    } finally {
      setSavingProfile(false);
    }
  }, [name, phoneNumber, address, refreshUser]);

  const handlePickAvatar = useCallback(async () => {
    if (isGoogleAccount) {
      appAlert('Không thể thay đổi', 'Ảnh đại diện tài khoản Google được đồng bộ trực tiếp từ Google.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      appAlert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh để đổi ảnh đại diện.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;

    try {
      setUploadingAvatar(true);
      const res = await profileController.uploadAvatar(result.assets[0].uri);
      setProfile(res.data);
      await refreshUser();
      appAlert('Thành công', 'Đã cập nhật ảnh đại diện mới.');
    } catch (err: any) {
      appAlert('Lỗi', err?.response?.data?.message || 'Không thể tải lên ảnh đại diện.');
    } finally {
      setUploadingAvatar(false);
    }
  }, [isGoogleAccount, refreshUser]);

  const handleSetDefaultAddress = useCallback(async (id: number) => {
    try {
      await addressController.setDefault(id);
      const res = await addressController.getAddresses();
      setAddresses(Array.isArray(res.data) ? res.data : []);
      appAlert('Thành công', 'Đã đặt làm địa chỉ mặc định.');
    } catch (err: any) {
      appAlert('Lỗi', err?.response?.data?.message || 'Không thể đặt địa chỉ mặc định.');
    }
  }, []);

  const handleDeleteAddress = useCallback((id: number) => {
    appAlert(
      'Xóa địa chỉ',
      'Bạn có chắc chắn muốn xóa địa chỉ giao hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await addressController.deleteAddress(id);
              setAddresses((prev) => prev.filter((a) => a.id !== id));
              appAlert('Thành công', 'Đã xóa địa chỉ.');
            } catch (err: any) {
              appAlert('Lỗi', err?.response?.data?.message || 'Không thể xóa địa chỉ.');
            }
          },
        },
      ],
      'confirm'
    );
  }, []);

  const handleCreateAddress = useCallback(async () => {
    if (!newFullName.trim() || !newPhone.trim() || !newAddressText.trim()) {
      appAlert('Thiếu thông tin', 'Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ chi tiết.');
      return;
    }
    const provinceObj = provinces.find((p) => p.ProvinceID === selectedProvinceId);
    const districtObj = districts.find((d) => d.DistrictID === selectedDistrictId);
    const wardObj = wards.find((w) => w.WardCode === selectedWardCode);
    if (!provinceObj || !districtObj || !wardObj) {
      appAlert('Thiếu địa giới GHN', 'Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã.');
      return;
    }

    try {
      setIsAddingAddress(true);
      const res = await addressController.createAddress({
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        address: newAddressText.trim(),
        city: `${wardObj.WardName}, ${districtObj.DistrictName}, ${provinceObj.ProvinceName}`,
        provinceId: provinceObj.ProvinceID,
        districtId: districtObj.DistrictID,
        wardCode: wardObj.WardCode,
        isDefault: addresses.length === 0,
      });
      setAddresses((prev) => [res.data, ...prev]);
      setIsAddressModalVisible(false);
      setNewFullName('');
      setNewPhone('');
      setNewAddressText('');
      setSelectedProvinceId(null);
      setSelectedDistrictId(null);
      setSelectedWardCode(null);
      appAlert('Thành công', 'Đã thêm địa chỉ giao hàng mới.');
    } catch (err: any) {
      appAlert('Lỗi', err?.response?.data?.message || 'Không thể thêm địa chỉ.');
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
    addresses.length,
  ]);

  const handleChangePassword = useCallback(async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      appAlert('Thiếu thông tin', 'Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận.');
      return;
    }
    if (newPassword.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(newPassword)) {
      appAlert(
        'Mật khẩu chưa đạt chuẩn',
        'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm cả chữ cái và chữ số.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      appAlert('Không khớp', 'Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    try {
      setChangingPassword(true);
      await profileController.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      appAlert(
        'Đổi mật khẩu thành công',
        'Vui lòng đăng nhập lại bằng mật khẩu mới để bảo mật phiên làm việc.',
        [
          {
            text: 'Đăng nhập lại',
            onPress: async () => {
              await logout();
              navigation.replace('Login');
            },
          },
        ],
        'success'
      );
    } catch (err: any) {
      appAlert('Lỗi', err?.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setChangingPassword(false);
    }
  }, [oldPassword, newPassword, confirmPassword, logout, navigation]);

  return {
    activeTab,
    setActiveTab,
    loading,
    profile,
    isGoogleAccount,
    name,
    setName,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,
    savingProfile,
    uploadingAvatar,
    handleSaveProfile,
    handlePickAvatar,
    addresses,
    loadingAddresses,
    isAddressModalVisible,
    setIsAddressModalVisible,
    newFullName,
    setNewFullName,
    newPhone,
    setNewPhone,
    newAddressText,
    setNewAddressText,
    isAddingAddress,
    provinces,
    districts,
    wards,
    selectedProvinceId,
    selectedDistrictId,
    selectedWardCode,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    handleSelectProvince: (id: number) => {
      setSelectedProvinceId(id);
      setSelectedDistrictId(null);
      setSelectedWardCode(null);
    },
    handleSelectDistrict: (id: number) => {
      setSelectedDistrictId(id);
      setSelectedWardCode(null);
    },
    setSelectedWardCode,
    handleSetDefaultAddress,
    handleDeleteAddress,
    handleCreateAddress,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    changingPassword,
    handleChangePassword,
    scrollRef,
    keyboardHeight,
    scrollToEndOnFocus,
  };
};
