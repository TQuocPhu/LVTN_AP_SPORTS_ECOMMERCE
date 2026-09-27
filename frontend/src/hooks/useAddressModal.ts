'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { ShippingAddress, ShippingAddressRequest, GhnProvince, GhnDistrict, GhnWard } from '@/types/address';
import { isApiError } from '@/services/api-client';
import { useLocation } from '@/hooks/useLocation';
import { locationController } from '@/controllers/location-controller';

// Forward Geocoding via Backend Proxy (chống CORS & rate-limit)
async function forwardGeocode(query: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await locationController.forwardGeocode(query);
    const data = res?.data as { lat?: string | number; lon?: string | number } | undefined;
    if (data && data.lat && data.lon) {
      return { lat: parseFloat(String(data.lat)), lon: parseFloat(String(data.lon)) };
    }
    return null;
  } catch {
    return null;
  }
}

// Chuẩn hóa tên đơn vị hành chính tiếng Việt (bỏ tiền tố Tỉnh, Thành phố, Quận, Huyện, Phường, Xã...)
function cleanAdminName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(tỉnh|thành phố|tp\.|quận|huyện|thị xã|phường|xã|thị trấn)\s+/i, '')
    .trim();
}

// So sánh tên đơn vị hành chính GHN với thông tin địa danh từ Nominatim
function isGhnUnitMatch(
  ghnName: string,
  nameExtensions: string[] | undefined,
  fullTextLower: string,
  rawAddr: Record<string, unknown>
): boolean {
  if (!ghnName) return false;
  const rawGhnLower = ghnName.toLowerCase().trim();
  if (rawGhnLower && fullTextLower.includes(rawGhnLower)) {
    return true;
  }

  const cleanName = cleanAdminName(ghnName);
  if (cleanName && fullTextLower.includes(cleanName)) {
    return true;
  }

  const addrValues = Object.values(rawAddr)
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.toLowerCase().trim());

  if (addrValues.some((v) => v === rawGhnLower || (cleanName && v.includes(cleanName)))) {
    return true;
  }

  if (nameExtensions && Array.isArray(nameExtensions)) {
    return nameExtensions.some((ext) => {
      const extLower = ext.toLowerCase().trim();
      const cleanExt = cleanAdminName(ext);
      return (
        extLower &&
        (fullTextLower.includes(extLower) || (cleanExt && fullTextLower.includes(cleanExt)))
      );
    });
  }

  return false;
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

export function useAddressModal({
  isOpen,
  addressToEdit,
  onSave,
  onClose,
}: UseAddressModalOptions): UseAddressModalReturn {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetailState] = useState('');
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
    setSelectedProvinceId: setSelectedProvinceIdRaw,
    setSelectedDistrictId: setSelectedDistrictIdRaw,
    setSelectedWardCode: setSelectedWardCodeRaw,
    resetLocation, initLocation,
  } = location;

  // Wrapped setters: khi người dùng tự nhập/chọn địa chỉ thủ công, reset tọa độ GPS cũ
  const setAddressDetail = useCallback((val: string) => {
    setAddressDetailState(val);
    setLatitude(undefined);
    setLongitude(undefined);
    setGpsStatus('idle');
  }, []);

  const setSelectedProvinceId = useCallback((id: number | null) => {
    setSelectedProvinceIdRaw(id);
    setLatitude(undefined);
    setLongitude(undefined);
    setGpsStatus('idle');
  }, [setSelectedProvinceIdRaw]);

  const setSelectedDistrictId = useCallback((id: number | null) => {
    setSelectedDistrictIdRaw(id);
    setLatitude(undefined);
    setLongitude(undefined);
    setGpsStatus('idle');
  }, [setSelectedDistrictIdRaw]);

  const setSelectedWardCode = useCallback((code: string | null) => {
    setSelectedWardCodeRaw(code);
    setLatitude(undefined);
    setLongitude(undefined);
    setGpsStatus('idle');
  }, [setSelectedWardCodeRaw]);

  // Reset & khởi tạo form khi mở modal
  useEffect(() => {
    setFieldErrors({});
    setGpsStatus('idle');
    if (addressToEdit) {
      setFullName(addressToEdit.fullName || '');
      setPhone(addressToEdit.phone || '');
      setAddressDetailState(addressToEdit.address || '');
      setIsDefault(addressToEdit.isDefault || false);
      setLatitude(addressToEdit.latitude);
      setLongitude(addressToEdit.longitude);
      initLocation(addressToEdit.provinceId, addressToEdit.districtId, addressToEdit.wardCode);
    } else {
      setFullName('');
      setPhone('');
      setAddressDetailState('');
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

  // Forward Geocoding: tính lat/lon từ địa chỉ text (Nominatim)
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

  // Nút Lấy vị trí GPS:
  // Luôn lấy vị trí GPS thực từ trình duyệt và Reverse Geocode tự động chọn 3 ô Dropdown (Tỉnh > Quận > Phường)
  const handleGetGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }

    setIsGettingGPS(true);
    setGpsStatus('idle');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        let reverseSuccess = false;
        try {
          const res = await locationController.reverseGeocode(lat, lon);
          const data = res?.data as { display_name?: string; address?: Record<string, unknown> } | undefined;
          if (data) {
            const fullTextLower = (data.display_name || '').toLowerCase();
            const rawAddr = (data.address || {}) as Record<string, unknown>;

            let provList = provinces;
            if (!provList || provList.length === 0) {
              const resProv = await locationController.getProvinces();
              provList = (resProv?.data || resProv || []) as GhnProvince[];
            }

            const rawState = String(rawAddr.state || rawAddr.province || '').toLowerCase().trim();
            const cleanState = cleanAdminName(rawState);

            // Vòng 1: Khớp CHÍNH XÁC trường state/province cấu trúc
            let matchedProv = provList.find((p) => {
              const pClean = cleanAdminName(p.ProvinceName);
              return cleanState && pClean === cleanState;
            });

            // Vòng 2: Mới dùng đối soát mở rộng nếu Vòng 1 chưa ra
            if (!matchedProv) {
              matchedProv = provList.find((p) =>
                isGhnUnitMatch(p.ProvinceName, p.NameExtension, fullTextLower, rawAddr)
              );
            }

            let matchedProvId: number | undefined = matchedProv?.ProvinceID;
            let matchedDistId: number | undefined = undefined;
            let matchedWardCode: string | undefined = undefined;

            if (matchedProvId) {
              const distRes = await locationController.getDistricts(matchedProvId);
              const distList = (distRes?.data || distRes || []) as GhnDistrict[];

              const rawDistrictStr = String(rawAddr.district || rawAddr.county || rawAddr.city_district || rawAddr.town || '').toLowerCase().trim();
              const cleanDistStr = cleanAdminName(rawDistrictStr);

              // 1. Thử khớp Quận/Huyện trực tiếp (ưu tiên khớp chính xác tên cấu trúc)
              let matchedDist = distList.find((d) => {
                const dClean = cleanAdminName(d.DistrictName);
                return cleanDistStr && dClean === cleanDistStr;
              });

              if (!matchedDist) {
                matchedDist = distList.find((d) =>
                  isGhnUnitMatch(d.DistrictName, d.NameExtension, fullTextLower, rawAddr)
                );
              }

              if (matchedDist) {
                matchedDistId = matchedDist.DistrictID;

                const wardRes = await locationController.getWards(matchedDistId);
                const wardList = (wardRes?.data || wardRes || []) as GhnWard[];

                let matchedWard = wardList.find((w) =>
                  isGhnUnitMatch(w.WardName, w.NameExtension, fullTextLower, rawAddr)
                );

                if (matchedWard) {
                  matchedWardCode = matchedWard.WardCode;
                }
              }

              // 2. Nếu chưa tìm thấy Phường (do tên Quận/Huyện từ GPS bị bỏ hoặc khác tên GHN)
              // Duyệt qua từng Quận/Huyện của Tỉnh đó để đối soát Phường/Xã $\rightarrow$ từ đó suy ngược ra Quận/Huyện của GHN!
              if (!matchedWardCode && distList.length > 0) {
                for (const dist of distList) {
                  try {
                    const wardRes = await locationController.getWards(dist.DistrictID);
                    const wardList = (wardRes?.data || wardRes || []) as GhnWard[];

                    let matchedWard = wardList.find((w) =>
                      isGhnUnitMatch(w.WardName, w.NameExtension, fullTextLower, rawAddr)
                    );

                    if (matchedWard) {
                      matchedDistId = dist.DistrictID;
                      matchedWardCode = matchedWard.WardCode;
                      break; // Đã suy ra chính xác Quận & Phường thuộc GHN!
                    }
                  } catch {
                    /* tiếp tục thử quận khác */
                  }
                }
              }

              await initLocation(matchedProvId, matchedDistId, matchedWardCode);
              reverseSuccess = true;
            }

            const roadName = [rawAddr.house_number, rawAddr.road || rawAddr.pedestrian].filter(Boolean).join(' ');
            if (roadName) {
              setAddressDetailState(roadName);
            }
          }
        } catch (err) {
          console.error('Lỗi reverse geocoding GPS:', err);
        } finally {
          setGpsStatus(reverseSuccess || (lat && lon) ? 'success' : 'error');
          setIsGettingGPS(false);
        }
      },
      () => {
        setGpsStatus('error');
        setIsGettingGPS(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [provinces, initLocation]);

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

      // Auto-geocode nếu chưa có tọa độ (khi người dùng nhập/chọn địa chỉ thủ công)
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

