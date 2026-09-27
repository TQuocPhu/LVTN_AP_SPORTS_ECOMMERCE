'use client';

import { ShippingAddress, ShippingAddressRequest } from '@/types/address';
import { useAddressModal } from '@/hooks/useAddressModal';
import {
  X, MapPin, User, Phone, Save, Loader2, AlertCircle,
  Navigation, ChevronDown, CheckCircle2,
} from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit: ShippingAddress | null;
  onSave: (data: ShippingAddressRequest) => Promise<unknown>;
}

export default function AddressModal({ isOpen, onClose, addressToEdit, onSave }: AddressModalProps) {
  const {
    fullName, phone, addressDetail, isDefault, latitude, longitude,
    setFullName, setPhone, setAddressDetail, setIsDefault,
    provinces, districts, wards,
    loadingProvinces, loadingDistricts, loadingWards,
    selectedProvinceId, selectedDistrictId, selectedWardCode,
    setSelectedProvinceId, setSelectedDistrictId, setSelectedWardCode,
    gpsStatus, isGettingGPS, isGeocoding,
    handleGetGPS, fieldErrors, clearFieldError,
    isSubmitting, hasLocationSelected, handleSubmit,
  } = useAddressModal({ isOpen, addressToEdit, onSave, onClose });

  if (!isOpen) return null;

  const inputCls = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border ${
      fieldErrors[field]
        ? 'border-red-500'
        : 'border-slate-300 dark:border-slate-800 focus:border-red-500'
    } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm`;

  const selectCls = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border ${
      fieldErrors[field] ? 'border-red-500' : 'border-slate-300 dark:border-slate-800'
    } text-slate-900 dark:text-slate-100 focus:outline-none text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl relative">
        <div className="p-6 sm:p-8 space-y-5">

          {/* Close Button */}
          <button
            id="btn-close-address-modal"
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4 pr-10">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
              {addressToEdit ? 'Chỉnh Sửa Địa Chỉ Giao Hàng' : 'Thêm Địa Chỉ Giao Hàng Mới'}
            </h3>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Row: Tên + SĐT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tên người nhận */}
              <div className="space-y-1.5">
                <label htmlFor="input-address-fullname" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  Tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-address-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); clearFieldError('fullName'); }}
                  placeholder="Họ và tên người nhận"
                  className={inputCls('fullName')}
                />
                {fieldErrors.fullName && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label htmlFor="input-address-phone" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-address-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); clearFieldError('phone'); }}
                  placeholder="0912 345 678"
                  className={inputCls('phone')}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{fieldErrors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Tỉnh/Thành phố */}
            <div className="space-y-1.5">
              <label htmlFor="select-province" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tỉnh / Thành phố <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-province"
                  disabled={loadingProvinces}
                  value={selectedProvinceId ?? ''}
                  onChange={(e) => { setSelectedProvinceId(e.target.value ? Number(e.target.value) : null); clearFieldError('province'); }}
                  className={selectCls('province')}
                >
                  <option value="">{loadingProvinces ? 'Đang tải...' : '-- Chọn Tỉnh/Thành phố --'}</option>
                  {provinces.map((p) => (
                    <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {fieldErrors.province && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />{fieldErrors.province}
                </p>
              )}
            </div>

            {/* Row: Quận/Huyện + Phường/Xã */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quận/Huyện */}
              <div className="space-y-1.5">
                <label htmlFor="select-district" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Quận / Huyện <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="select-district"
                    disabled={!selectedProvinceId || loadingDistricts}
                    value={selectedDistrictId ?? ''}
                    onChange={(e) => { setSelectedDistrictId(e.target.value ? Number(e.target.value) : null); clearFieldError('district'); }}
                    className={selectCls('district')}
                  >
                    <option value="">
                      {loadingDistricts ? 'Đang tải...' : !selectedProvinceId ? '-- Chọn Tỉnh trước --' : '-- Chọn Quận/Huyện --'}
                    </option>
                    {districts.map((d) => (
                      <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {fieldErrors.district && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{fieldErrors.district}
                  </p>
                )}
              </div>

              {/* Phường/Xã */}
              <div className="space-y-1.5">
                <label htmlFor="select-ward" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Phường / Xã <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="select-ward"
                    disabled={!selectedDistrictId || loadingWards}
                    value={selectedWardCode ?? ''}
                    onChange={(e) => { setSelectedWardCode(e.target.value || null); clearFieldError('ward'); }}
                    className={selectCls('ward')}
                  >
                    <option value="">
                      {loadingWards ? 'Đang tải...' : !selectedDistrictId ? '-- Chọn Quận trước --' : '-- Chọn Phường/Xã --'}
                    </option>
                    {wards.map((w) => (
                      <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {fieldErrors.ward && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />{fieldErrors.ward}
                  </p>
                )}
              </div>
            </div>

            {/* Địa chỉ chi tiết */}
            <div className="space-y-1.5">
              <label htmlFor="input-address-detail" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Địa chỉ chi tiết (nhập số nhà, tên đường) <span className="text-red-500">*</span>
              </label>
              <textarea
                id="input-address-detail"
                required
                rows={2}
                value={addressDetail}
                onChange={(e) => { setAddressDetail(e.target.value); clearFieldError('address'); }}
                placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Tòa nhà ABC..."
                className={`${inputCls('address')} resize-none`}
              />
              {fieldErrors.address && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />{fieldErrors.address}
                </p>
              )}
            </div>

            {/* GPS Section */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    Tọa độ GPS địa lý
                  </p>
                  {latitude && longitude ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Tọa độ GPS sẽ tự động tính từ địa chỉ đã chọn khi lưu
                    </p>
                  )}
                </div>
              </div>

              {isGeocoding && (
                <p className="text-xs text-blue-400 flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang tự động tính tọa độ từ địa chỉ...
                </p>
              )}
            </div>

            {/* Checkbox Mặc định */}
            <div className="flex items-center gap-2">
              <input
                id="checkbox-address-default"
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="checkbox-address-default" className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
                Đặt làm địa chỉ giao hàng mặc định
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                id="btn-cancel-address-modal"
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                id="btn-save-address-modal"
                type="submit"
                disabled={isSubmitting || !hasLocationSelected}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isSubmitting || isGeocoding
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />}
                {isGeocoding ? 'Đang tính tọa độ...' : isSubmitting ? 'Đang lưu...' : 'Lưu Địa Chỉ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
