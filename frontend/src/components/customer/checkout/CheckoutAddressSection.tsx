'use client';

import React from 'react';
import { ShippingAddress } from '@/types/address';
import { MapPin, Phone, User, Map, CheckCircle2, ChevronRight, Plus } from 'lucide-react';

interface CheckoutAddressSectionProps {
  selectedAddress: ShippingAddress | null;
  loading: boolean;
  onOpenSelectModal: () => void;
}

export function CheckoutAddressSection({
  selectedAddress,
  loading,
  onOpenSelectModal,
}: CheckoutAddressSectionProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-20 bg-slate-100 dark:bg-slate-950 rounded-xl"></div>
      </div>
    );
  }

  const fullAddressString = selectedAddress
    ? [selectedAddress.address, selectedAddress.city].filter(Boolean).join(', ')
    : '';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Địa Chỉ Giao Hàng</span>
              {selectedAddress?.isDefault && (
                <span className="text-[10px] font-extrabold bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
                  Mặc định
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thông tin sẽ được sử dụng để đóng gói và vận chuyển đơn hàng.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSelectModal}
          className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 hover:underline transition-colors"
        >
          <span>{selectedAddress ? 'Đổi địa chỉ' : 'Thêm địa chỉ'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Address Form READONLY */}
      {selectedAddress ? (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Người nhận */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>Họ và tên người nhận</span>
              </label>
              <input
                type="text"
                readOnly
                value={selectedAddress.fullName || ''}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-not-allowed select-none"
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-orange-500" />
                <span>Số điện thoại liên hệ</span>
              </label>
              <input
                type="text"
                readOnly
                value={selectedAddress.phone || ''}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Chi tiết địa chỉ */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Địa chỉ nhận hàng chi tiết</span>
            </label>
            <input
              type="text"
              readOnly
              value={fullAddressString}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-not-allowed select-none"
            />
          </div>

          {/* GPS Coordinates Badge if available */}
          {(selectedAddress.latitude || selectedAddress.longitude) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px] font-semibold border border-emerald-500/20">
              <Map className="w-3.5 h-3.5 shrink-0" />
              <span>
                Đã định vị GPS ({selectedAddress.latitude?.toFixed(4)}, {selectedAddress.longitude?.toFixed(4)}) - Sẵn sàng cho GHN Express
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Chưa chọn địa chỉ giao hàng
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Vui lòng chọn hoặc thêm địa chỉ mới để tiếp tục đặt hàng.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenSelectModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Chọn / Thêm Địa Chỉ</span>
          </button>
        </div>
      )}
    </div>
  );
}
