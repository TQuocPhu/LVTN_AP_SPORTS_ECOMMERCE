'use client';

import React from 'react';
import { ShippingAddress } from '@/types/address';
import { X, MapPin, Check, Plus } from 'lucide-react';

interface AddressSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: ShippingAddress[];
  selectedAddress: ShippingAddress | null;
  onSelectAddress: (address: ShippingAddress) => void;
  onAddNewAddress?: () => void;
}

export function AddressSelectModal({
  isOpen,
  onClose,
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddNewAddress,
}: AddressSelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chọn Địa Chỉ Giao Hàng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Danh sách các địa chỉ bạn đã lưu trong tài khoản.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Address List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {addresses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Chưa có địa chỉ nào trong danh sách.
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = selectedAddress?.id === addr.id;
              const fullAddr = [addr.address, addr.city].filter(Boolean).join(', ');

              return (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 ring-2 ring-orange-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500 text-white'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {addr.fullName}
                      </span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {addr.phone}
                      </span>
                      {(addr.isDefault || addr.default) && (
                        <span className="text-[10px] font-extrabold bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {fullAddr}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          {onAddNewAddress ? (
            <button
              type="button"
              onClick={onAddNewAddress}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm địa chỉ mới</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
