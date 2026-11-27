import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { GhnDistrict, GhnProvince, GhnWard, ShippingAddress } from '../types';
import { useKeyboardOffset } from './useKeyboardOffset';

export type ActiveLocationPicker = 'province' | 'district' | 'ward' | null;

interface UseNewAddressModalParams {
  addresses: ShippingAddress[];
  provinces: GhnProvince[];
  districts: GhnDistrict[];
  wards: GhnWard[];
  selectedProvinceId: number | null;
  selectedDistrictId: number | null;
  selectedWardCode: string | null;
  onClose: () => void;
}

export const useNewAddressModal = ({
  addresses,
  provinces,
  districts,
  wards,
  selectedProvinceId,
  selectedDistrictId,
  selectedWardCode,
  onClose,
}: UseNewAddressModalParams) => {
  const { height: windowHeight } = useWindowDimensions();
  const { scrollRef, keyboardHeight, scrollToEndOnFocus } = useKeyboardOffset();

  const [mode, setMode] = useState<'list' | 'new'>(addresses.length > 0 ? 'list' : 'new');
  const [activePicker, setActivePicker] = useState<ActiveLocationPicker>(null);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.ProvinceID === selectedProvinceId),
    [provinces, selectedProvinceId]
  );
  const selectedDistrict = useMemo(
    () => districts.find((d) => d.DistrictID === selectedDistrictId),
    [districts, selectedDistrictId]
  );
  const selectedWard = useMemo(
    () => wards.find((w) => w.WardCode === selectedWardCode),
    [wards, selectedWardCode]
  );

  const filteredPickerItems = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (activePicker === 'province') {
      return provinces
        .filter((p) => !q || p.ProvinceName.toLowerCase().includes(q))
        .map((p) => ({ key: String(p.ProvinceID), label: p.ProvinceName, id: p.ProvinceID }));
    }
    if (activePicker === 'district') {
      return districts
        .filter((d) => !q || d.DistrictName.toLowerCase().includes(q))
        .map((d) => ({ key: String(d.DistrictID), label: d.DistrictName, id: d.DistrictID }));
    }
    if (activePicker === 'ward') {
      return wards
        .filter((w) => !q || w.WardName.toLowerCase().includes(q))
        .map((w) => ({ key: w.WardCode, label: w.WardName, code: w.WardCode }));
    }
    return [];
  }, [activePicker, pickerSearch, provinces, districts, wards]);

  const openPicker = useCallback(
    (picker: ActiveLocationPicker) => {
      if (picker === 'district' && !selectedProvinceId) return;
      if (picker === 'ward' && !selectedDistrictId) return;
      setPickerSearch('');
      setActivePicker((prev) => (prev === picker ? null : picker));
    },
    [selectedProvinceId, selectedDistrictId]
  );

  const closePicker = useCallback(() => {
    setActivePicker(null);
    setPickerSearch('');
  }, []);

  const handleClose = useCallback(() => {
    closePicker();
    onClose();
  }, [closePicker, onClose]);

  const modalMaxHeight =
    keyboardHeight > 0
      ? Math.max(280, windowHeight - keyboardHeight - 40)
      : Math.round(windowHeight * 0.88);

  return {
    scrollRef,
    keyboardHeight,
    modalMaxHeight,
    scrollToEndOnFocus,
    mode,
    setMode,
    activePicker,
    pickerSearch,
    setPickerSearch,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    filteredPickerItems,
    openPicker,
    closePicker,
    handleClose,
  };
};
