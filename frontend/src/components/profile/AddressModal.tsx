'use client';

import { useState, useEffect, FormEvent } from 'react';
import { ShippingAddress, ShippingAddressRequest } from '@/types/address';
import { X, MapPin, User, Phone, Save, Loader2 } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit: ShippingAddress | null;
  onSave: (data: ShippingAddressRequest) => Promise<unknown>;
}

export default function AddressModal({
  isOpen,
  onClose,
  addressToEdit,
  onSave,
}: AddressModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (addressToEdit) {
      setFullName(addressToEdit.fullName || '');
      setPhone(addressToEdit.phone || '');
      setCity(addressToEdit.city || '');
      setAddress(addressToEdit.address || '');
      setIsDefault(addressToEdit.isDefault || false);
    } else {
      setFullName('');
      setPhone('');
      setCity('');
      setAddress('');
      setIsDefault(false);
    }
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSave({
        fullName,
        phone,
        city,
        address,
        isDefault,
      });
      onClose();
    } catch (err) {
      console.error('Lỗi lưu địa chỉ:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Close Button */}
        <button
          id="btn-close-address-modal"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="border-b border-slate-700 pb-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#ffffff' }}>
            <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
            {addressToEdit ? 'Chỉnh Sửa Địa Chỉ Giao Hàng' : 'Thêm Địa Chỉ Giao Hàng Mới'}
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên người nhận */}
          <div className="space-y-1.5">
            <label htmlFor="input-address-fullname" className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              Tên người nhận
            </label>
            <input
              id="input-address-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên người nhận hàng"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label htmlFor="input-address-phone" className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              Số điện thoại người nhận
            </label>
            <input
              id="input-address-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại giao hàng"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {/* Tỉnh/Thành phố & Quận/Huyện */}
          <div className="space-y-1.5">
            <label htmlFor="input-address-city" className="text-sm font-medium text-slate-300">
              Tỉnh/Thành phố, Quận/Huyện, Phường/Xã
            </label>
            <input
              id="input-address-city"
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ví dụ: TP. Hồ Chí Minh, Quận 1, Phường Bến Nghé"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {/* Địa chỉ chi tiết */}
          <div className="space-y-1.5">
            <label htmlFor="input-address-detail" className="text-sm font-medium text-slate-300">
              Địa chỉ chi tiết (Số nhà, tên đường...)
            </label>
            <textarea
              id="input-address-detail"
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập số nhà, ngõ ngách, tên tòa nhà..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm resize-none"
            />
          </div>

          {/* Checkbox Mặc định */}
          <div className="flex items-center gap-2 pt-2">
            <input
              id="checkbox-address-default"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-red-600 focus:ring-red-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="checkbox-address-default" className="text-sm text-slate-300 cursor-pointer">
              Đặt làm địa chỉ giao hàng mặc định
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              id="btn-cancel-address-modal"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              id="btn-save-address-modal"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/30 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu Địa Chỉ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
