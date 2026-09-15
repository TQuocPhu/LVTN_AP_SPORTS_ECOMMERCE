'use client';

import { useState, FormEvent } from 'react';
import { ChangePasswordRequest } from '@/types/profile';
import { Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react';

interface ChangePasswordTabProps {
  onChangePassword: (data: ChangePasswordRequest) => Promise<unknown>;
}

export default function ChangePasswordTab({ onChangePassword }: ChangePasswordTabProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onChangePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });
      // Reset form on success
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6 max-w-2xl">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Thay Đổi Mật Khẩu</h2>
        <p className="text-sm text-slate-400 mt-1">Bảo vệ tài khoản của bạn bằng cách cập nhật mật khẩu định kỳ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mật khẩu hiện tại */}
        <div className="space-y-2">
          <label htmlFor="input-old-password" className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-500" />
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              id="input-old-password"
              type={showOld ? 'text' : 'password'}
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors pr-12"
            />
            <button
              id="btn-toggle-old-pwd"
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div className="space-y-2">
          <label htmlFor="input-new-password" className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-500" />
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              id="input-new-password"
              type={showNew ? 'text' : 'password'}
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors pr-12"
            />
            <button
              id="btn-toggle-new-pwd"
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div className="space-y-2">
          <label htmlFor="input-confirm-password" className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-500" />
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              id="input-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors pr-12"
            />
            <button
              id="btn-toggle-confirm-pwd"
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            id="btn-submit-change-password"
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Cập Nhật Mật Khẩu
          </button>
        </div>
      </form>
    </div>
  );
}
