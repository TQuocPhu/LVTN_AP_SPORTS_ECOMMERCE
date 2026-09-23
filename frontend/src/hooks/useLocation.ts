import { useState, useEffect, useCallback } from 'react';
import { locationController } from '@/controllers/location-controller';
import { GhnProvince, GhnDistrict, GhnWard } from '@/types/address';

interface UseLocationReturn {
  provinces: GhnProvince[];
  districts: GhnDistrict[];
  wards: GhnWard[];
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  selectedProvinceId: number | null;
  selectedDistrictId: number | null;
  selectedWardCode: string | null;
  provinceName: string;
  districtName: string;
  wardName: string;
  setSelectedProvinceId: (id: number | null) => void;
  setSelectedDistrictId: (id: number | null) => void;
  setSelectedWardCode: (code: string | null) => void;
  resetLocation: () => void;
  initLocation: (provinceId?: number, districtId?: number, wardCode?: string) => void;
}

/**
 * Hook quản lý Dropdown Tỉnh/Thành > Quận/Huyện > Phường/Xã từ GHN Master Data.
 * Tự động load Districts khi chọn Province và load Wards khi chọn District.
 */
export function useLocation(): UseLocationReturn {
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  const [selectedProvinceId, setSelectedProvinceIdState] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictIdState] = useState<number | null>(null);
  const [selectedWardCode, setSelectedWardCodeState] = useState<string | null>(null);

  const fetchProvinces = useCallback(async () => {
    setLoadingProvinces(true);
    try {
      const res = await locationController.getProvinces();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? (res as unknown as GhnProvince[])
        : [];
      if (list.length > 0) {
        setProvinces(list as GhnProvince[]);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách tỉnh/thành GHN:', err);
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  // Load Provinces khi mount hoặc khi chưa có data
  useEffect(() => {
    fetchProvinces();
  }, [fetchProvinces]);

  // Load Districts khi chọn Province
  useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrictIdState(null);
      setSelectedWardCodeState(null);
      return;
    }

    let cancelled = false;
    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await locationController.getDistricts(selectedProvinceId);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? (res as unknown as GhnDistrict[])
          : [];
        if (!cancelled) setDistricts(list as GhnDistrict[]);
      } catch (err) {
        console.error('Lỗi lấy danh sách quận/huyện GHN:', err);
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    };
    fetchDistricts();
    return () => { cancelled = true; };
  }, [selectedProvinceId]);

  // Load Wards khi chọn District
  useEffect(() => {
    if (!selectedDistrictId) {
      setWards([]);
      setSelectedWardCodeState(null);
      return;
    }

    let cancelled = false;
    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const res = await locationController.getWards(selectedDistrictId);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? (res as unknown as GhnWard[])
          : [];
        if (!cancelled) setWards(list as GhnWard[]);
      } catch (err) {
        console.error('Lỗi lấy danh sách phường/xã GHN:', err);
      } finally {
        if (!cancelled) setLoadingWards(false);
      }
    };
    fetchWards();
    return () => { cancelled = true; };
  }, [selectedDistrictId]);

  const setSelectedProvinceId = useCallback((id: number | null) => {
    setSelectedProvinceIdState(id);
    setSelectedDistrictIdState(null);
    setSelectedWardCodeState(null);
  }, []);

  const setSelectedDistrictId = useCallback((id: number | null) => {
    setSelectedDistrictIdState(id);
    setSelectedWardCodeState(null);
  }, []);

  const setSelectedWardCode = useCallback((code: string | null) => {
    setSelectedWardCodeState(code);
  }, []);

  const resetLocation = useCallback(() => {
    setSelectedProvinceIdState(null);
    setSelectedDistrictIdState(null);
    setSelectedWardCodeState(null);
    setDistricts([]);
    setWards([]);
  }, []);

  // Khởi tạo lại khi mở form chỉnh sửa (có sẵn provinceId, districtId, wardCode)
  const initLocation = useCallback(
    async (provinceId?: number, districtId?: number, wardCode?: string) => {
      if (provinceId) {
        setSelectedProvinceIdState(provinceId);
        // Load districts ngay
        try {
          const res = await locationController.getDistricts(provinceId);
          if (res?.data) setDistricts(res.data as unknown as GhnDistrict[]);
        } catch { /* silent */ }
      }
      if (districtId) {
        setSelectedDistrictIdState(districtId);
        // Load wards ngay
        try {
          const res = await locationController.getWards(districtId);
          if (res?.data) setWards(res.data as unknown as GhnWard[]);
        } catch { /* silent */ }
      }
      if (wardCode) {
        setSelectedWardCodeState(wardCode);
      }
    },
    []
  );

  // Tính tên hiển thị (text) từ các ID/code đã chọn
  const provinceName =
    provinces.find((p) => p.ProvinceID === selectedProvinceId)?.ProvinceName ?? '';
  const districtName =
    districts.find((d) => d.DistrictID === selectedDistrictId)?.DistrictName ?? '';
  const wardName = wards.find((w) => w.WardCode === selectedWardCode)?.WardName ?? '';

  return {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectedProvinceId,
    selectedDistrictId,
    selectedWardCode,
    provinceName,
    districtName,
    wardName,
    setSelectedProvinceId,
    setSelectedDistrictId,
    setSelectedWardCode,
    resetLocation,
    initLocation,
  };
}
