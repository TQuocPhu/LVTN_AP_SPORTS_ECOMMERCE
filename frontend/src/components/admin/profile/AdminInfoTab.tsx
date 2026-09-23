'use client';

import React, { useState, useEffect } from 'react';
import { UserResponse } from '@/types/auth';
import { UpdateAdminProfileRequest } from '@/types/admin-profile';
import { User, Phone, MapPin, Mail, Save, Loader2 } from 'lucide-react';

interface AdminInfoTabProps {
  profile: UserResponse;
  updating: boolean;
  onUpdate: (data: UpdateAdminProfileRequest) => Promise<unknown>;
}

export default function AdminInfoTab({ profile, updating, onUpdate }: AdminInfoTabProps) {
  const [formData, setFormData] = useState<UpdateAdminProfileRequest>({
    name: '',
    phoneNumber: '',
    address: '',
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // optional
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'phoneNumber') {
      if (value && !validatePhone(value)) {
        setPhoneError('Số điện thoại không hợp lệ (VD: 0912345678)');
      } else {
        setPhoneError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      setPhoneError('Số điện thoại không hợp lệ');
      return;
    }
    await onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email (Readonly) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Địa chỉ Email (Định danh đăng nhập)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-medium cursor-not-allowed select-none"
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Email đăng nhập không thể tự thay đổi. Vui lòng liên hệ Trưởng Quản Trị Hệ Thống nếu cần điều chỉnh.
        </p>
      </div>

      {/* Họ và Tên */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Họ và Tên <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            name="name"
            id="admin-profile-name-input"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Nhập họ và tên đầy đủ"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* Số điện thoại */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Số Điện Thoại Liên Hệ
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </div>
          <input
            type="text"
            name="phoneNumber"
            id="admin-profile-phone-input"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="VD: 0987654321"
            className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:ring-2 transition ${
              phoneError
                ? 'border-red-500 focus:ring-red-200'
                : 'border-slate-300 focus:ring-orange-500 focus:border-orange-500'
            }`}
          />
        </div>
        {phoneError && <p className="text-xs text-red-500 mt-1 font-medium">{phoneError}</p>}
      </div>

      {/* Địa chỉ */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Địa Chỉ Làm Việc / Cư Trú
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <textarea
            name="address"
            id="admin-profile-address-input"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ làm việc hoặc liên hệ"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          id="admin-profile-save-btn"
          disabled={updating || !!phoneError}
          className="flex items-center space-x-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm shadow-md transition"
        >
          {updating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
