'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { ShippingAddress, ShippingAddressRequest } from '@/types/address';
import { isApiError } from '@/services/api-client';
import { useLocation } from '@/hooks/useLocation';

// Geocoding via Nominatim (OpenStreetMap) - miễn phí, không cần API key
async function forwardGeocode(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const encoded = encodeURIComponent(query + ', Việt Nam');
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1&countrycodes=vn`,
      { headers: { 'Accept-Language': 'vi' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export type GpsStatus = 'idle' | 'success' | 'error';

export interface UseAddressModalReturn {
  // Form fields
  fullName: string;
  phone: string;
  addressDetail: string;
  isDefault: boolean;
  latitude: number | undefined;
  longitude: number | undefined;

  // Field setters
  setFullName: (v: string) => void;
  setPhone: (v: string) => void;
  setAddressDetail: (v: string) => void;
  setIsDefault: (v: boolean) => void;

  // Location dropdown state (từ useLocation)
  provinces: ReturnType<typeof useLocation>['provinces'];
  districts: ReturnType<typeof useLocation>['districts'];
  wards: ReturnType<typeof useLocation>['wards'];
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  selectedProvinceId: number | null;
  selectedDistrictId: number | null;
  selectedWardCode: string | null;
  setSelectedProvinceId: (id: number | null) => void;
  setSelectedDistrictId: (id: number | null) => void;
  setSelectedWardCode: (code: string | null) => void;

  // GPS & Geocoding
  gpsStatus: GpsStatus;
  isGettingGPS: boolean;
  isGeocoding: boolean;
  handleGetGPS: () => void;

  // Validation & submission
  fieldErrors: Record<string, string>;
  clearFieldError: (field: string) => void;
  isSubmitting: boolean;
  hasLocationSelected: boolean;
  handleSubmit: (e: FormEvent) => Promise<void>;
}

interface UseAddressModalOptions {
  isOpen: boolean;
  addressToEdit: ShippingAddress | null;
  onSave: (data: ShippingAddressRequest) => Promise<unknown>;
  onClose: () => void;
}

/**
 * Hook quản lý toàn bộ logic của Address Modal:
 * - Quản lý form state (fullName, phone, address, isDefault)
 * - Tích hợp GHN Dropdown cascade (Tỉnh > Quận > Phường) qua useLocation
 * - GPS lấy tọa độ thực từ trình duyệt
 * - Forward Geocoding tự động tính lat/lon từ địa chỉ text (Nominatim OSM)
 * - Validation & submit
 */
export function useAddressModal({
  isOpen,
  addressToEdit,
  onSave,
  onClose,
}: UseAddressModalOptions): UseAddressModalReturn {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // GPS & Geocoding state
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [isGettingGPS, setIsGettingGPS] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GHN Location Dropdown
  const location = useLocation();
  const {
    provinces, districts, wards,
    loadingProvinces, loadingDistricts, loadingWards,
    selectedProvinceId, selectedDistrictId, selectedWardCode,
    provinceName, districtName, wardName,
    setSelectedProvinceId, setSelectedDistrictId, setSelectedWardCode,
    resetLocation, initLocation,
  } = location;

  // Reset & khởi tạo form khi mở modal
  useEffect(() => {
    setFieldErrors({});
    setGpsStatus('idle');
    if (addressToEdit) {
      setFullName(addressToEdit.fullName || '');
      setPhone(addressToEdit.phone || '');
      setAddressDetail(addressToEdit.address || '');
      setIsDefault(addressToEdit.isDefault || false);
      setLatitude(addressToEdit.latitude);
      setLongitude(addressToEdit.longitude);
      // Khởi tạo cascade Dropdown với giá trị đã có
      initLocation(addressToEdit.provinceId, addressToEdit.districtId, addressToEdit.wardCode);
    } else {
      setFullName('');
      setPhone('');
      setAddressDetail('');
      setIsDefault(false);
      setLatitude(undefined);
      setLongitude(undefined);
      resetLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressToEdit, isOpen]);

  // Xoá lỗi từng field khi người dùng sửa
  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // Lấy tọa độ GPS thực từ trình duyệt
  const handleGetGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setIsGettingGPS(true);
    setGpsStatus('idle');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setGpsStatus('success');
        setIsGettingGPS(false);
      },
      () => {
        setGpsStatus('error');
        setIsGettingGPS(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Forward Geocoding: tính lat/lon từ địa chỉ text (Nominatim)
  // Có fallback: nếu không tìm được địa chỉ chi tiết → dùng Quận/Tỉnh làm centroid
  const resolveGeocode = useCallback(async (): Promise<{ lat?: number; lon?: number }> => {
    const fullAddr = [addressDetail, wardName, districtName, provinceName].filter(Boolean).join(', ');
    if (!fullAddr) return {};
    setIsGeocoding(true);
    try {
      const coords = await forwardGeocode(fullAddr);
      if (coords) {
        setLatitude(coords.lat);
        setLongitude(coords.lon);
        setGpsStatus('success');
        return { lat: coords.lat, lon: coords.lon };
      }
      // Fallback: geocode từ Quận/Huyện + Tỉnh/Thành
      if (districtName && provinceName) {
        const fallback = await forwardGeocode(`${districtName}, ${provinceName}`);
        if (fallback) {
          setLatitude(fallback.lat);
          setLongitude(fallback.lon);
          setGpsStatus('success');
          return { lat: fallback.lat, lon: fallback.lon };
        }
      }
    } finally {
      setIsGeocoding(false);
    }
    return {};
  }, [addressDetail, wardName, districtName, provinceName]);

  // Submit form
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate Dropdown bắt buộc
    const errs: Record<string, string> = {};
    if (!selectedProvinceId) errs.province = 'Vui lòng chọn Tỉnh/Thành phố';
    if (!selectedDistrictId) errs.district = 'Vui lòng chọn Quận/Huyện';
    if (!selectedWardCode) errs.ward = 'Vui lòng chọn Phường/Xã';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    try {
      setIsSubmitting(true);

      // Auto-geocode nếu chưa có tọa độ
      let finalLat = latitude;
      let finalLon = longitude;
      if (!finalLat || !finalLon) {
        const coords = await resolveGeocode();
        finalLat = coords.lat;
        finalLon = coords.lon;
      }

      // Tổng hợp city text từ tên Phường + Quận + Tỉnh
      const cityText = [wardName, districtName, provinceName].filter(Boolean).join(', ');

      await onSave({
        fullName,
        phone,
        address: addressDetail,
        city: cityText,
        provinceId: selectedProvinceId!,
        districtId: selectedDistrictId!,
        wardCode: selectedWardCode!,
        latitude: finalLat,
        longitude: finalLon,
        isDefault,
      });
      onClose();
    } catch (err: unknown) {
      if (isApiError(err) && err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedProvinceId, selectedDistrictId, selectedWardCode,
    latitude, longitude, resolveGeocode,
    wardName, districtName, provinceName,
    fullName, phone, addressDetail, isDefault,
    onSave, onClose,
  ]);

  const hasLocationSelected = !!(selectedProvinceId && selectedDistrictId && selectedWardCode);

  return {
    // Form fields
    fullName,
    phone,
    addressDetail,
    isDefault,
    latitude,
    longitude,

    // Field setters
    setFullName,
    setPhone,
    setAddressDetail,
    setIsDefault,

    // Location dropdown
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectedProvinceId,
    selectedDistrictId,
    selectedWardCode,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedWardCode,

    // GPS & Geocoding
    gpsStatus,
    isGettingGPS,
    isGeocoding,
    handleGetGPS,

    // Validation & submission
    fieldErrors,
    clearFieldError,
    isSubmitting,
    hasLocationSelected,
    handleSubmit,
  };
}
