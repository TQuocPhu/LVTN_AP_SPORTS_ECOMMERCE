'use client';

import React, { useState } from 'react';
import { ChangeAdminPasswordRequest } from '@/types/admin-profile';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AdminChangePasswordTabProps {
  updating: boolean;
  onChangePassword: (data: ChangeAdminPasswordRequest) => Promise<unknown>;
}

export default function AdminChangePasswordTab({
  updating,
  onChangePassword,
}: AdminChangePasswordTabProps) {
  const [formData, setFormData] = useState<ChangeAdminPasswordRequest>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg(null);
  };

  const isLengthValid = formData.newPassword.length >= 8;
  const hasLetterAndDigit = /^(?=.*[A-Za-z])(?=.*\d).+$/.test(formData.newPassword);
  const isMatch = formData.newPassword && formData.newPassword === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLengthValid || !hasLetterAndDigit) {
      setErrorMsg('Mật khẩu mới chưa đáp ứng tiêu chuẩn độ bảo mật.');
      return;
    }

    if (!isMatch) {
      setErrorMsg('Xác nhận mật khẩu mới không khớp.');
      return;
    }

    try {
      await onChangePassword(formData);
      // Reset form sau khi đổi thành công
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch {
      // Error đã handled bởi toast trong hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Mật khẩu hiện tại */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Mật Khẩu Hiện Tại <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showOld ? 'text' : 'password'}
            name="oldPassword"
            id="admin-profile-old-pass-input"
            value={formData.oldPassword}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu hiện tại"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mật khẩu mới */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Mật Khẩu Mới <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <input
            type={showNew ? 'text' : 'password'}
            name="newPassword"
            id="admin-profile-new-pass-input"
            value={formData.newPassword}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu mới"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Xác nhận Mật khẩu mới */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Xác Nhận Mật Khẩu Mới <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <input
            type={showConfirm ? 'text' : 'password'}
            name="confirmPassword"
            id="admin-profile-confirm-pass-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Nhập lại mật khẩu mới"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Password Policy Rules */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
        <span className="font-bold text-slate-700 block uppercase tracking-wider">
          Yêu Cầu Mật Khẩu An Toàn:
        </span>
        <div className="flex items-center space-x-2">
          <CheckCircle className={`w-3.5 h-3.5 ${isLengthValid ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span className={isLengthValid ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
            Độ dài từ 8 đến 100 ký tự
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className={`w-3.5 h-3.5 ${hasLetterAndDigit ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span className={hasLetterAndDigit ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
            Chứa ít nhất 1 chữ cái và 1 chữ số
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className={`w-3.5 h-3.5 ${isMatch ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span className={isMatch ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
            Xác nhận mật khẩu mới hoàn toàn trùng khớp
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          id="admin-profile-change-pass-btn"
          disabled={updating || !isLengthValid || !hasLetterAndDigit || !isMatch}
          className="flex items-center space-x-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg font-semibold text-sm shadow-md transition"
        >
          {updating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang cập nhật...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Đổi Mật Khẩu</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
