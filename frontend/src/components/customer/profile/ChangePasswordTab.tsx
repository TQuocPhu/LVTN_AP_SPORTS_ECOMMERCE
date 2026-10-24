'use client';

import { ChangePasswordRequest, UserProfile } from '@/types/profile';
import { useChangePasswordForm } from '@/hooks/useChangePasswordForm';
import { Lock, Eye, EyeOff, Save, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

interface ChangePasswordTabProps {
  profile?: UserProfile | null;
  onChangePassword: (data: ChangePasswordRequest) => Promise<unknown>;
}

/**
 * Component Thay Đổi Mật Khẩu của khách hàng (ChangePasswordTab).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Không sử dụng useState / useEffect trong Component.
 * - Toàn bộ trạng thái và xử lý sự kiện nằm tại `useChangePasswordForm`.
 * - Nếu tài khoản là tài khoản đăng nhập bằng Google (`isGoogleAccount`), hiển thị thông báo khóa chức năng đổi mật khẩu.
 */
export default function ChangePasswordTab({
  profile,
  onChangePassword,
}: ChangePasswordTabProps) {
  const {
    oldPassword,
    newPassword,
    confirmPassword,
    fieldErrors,
    showOld,
    showNew,
    showConfirm,
    isSubmitting,
    isGoogleAccount,
    hasInput,
    handleOldPasswordChange,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    toggleShowOld,
    toggleShowNew,
    toggleShowConfirm,
    handleSubmit,
  } = useChangePasswordForm({
    profile,
    onChangePassword,
  });

  const inputBase =
    'w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors pr-12';
  const inputNormal =
    'border-slate-300 dark:border-slate-800 focus:border-red-500 dark:focus:border-red-500';
  const inputError = 'border-red-500 focus:border-red-500';
  const labelClass =
    'text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2';

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 max-w-2xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Thay Đổi Mật Khẩu
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bảo vệ tài khoản của bạn bằng cách cập nhật mật khẩu định kỳ
        </p>
      </div>

      {isGoogleAccount ? (
        <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tài khoản được bảo mật bởi Google OAuth2
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tài khoản của bạn (<span className="font-semibold">{profile?.email}</span>) đang sử dụng phương thức đăng nhập trực tiếp qua Google nên không sử dụng mật khẩu nội bộ tại hệ thống AP Sports.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Để thay đổi mật khẩu hoặc cài đặt bảo mật 2 lớp, vui lòng thực hiện trực tiếp trong phần Quản lý Tài khoản Google của bạn.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mật khẩu hiện tại */}
          <div className="space-y-2">
            <label htmlFor="input-old-password" className={labelClass}>
              <Lock className="w-4 h-4 text-red-500" />
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                id="input-old-password"
                type={showOld ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => handleOldPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className={`${inputBase} ${fieldErrors.oldPassword ? inputError : inputNormal}`}
              />
              <button
                id="btn-toggle-old-pwd"
                type="button"
                onClick={toggleShowOld}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.oldPassword && (
              <p className="text-xs font-semibold text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fieldErrors.oldPassword}</span>
              </p>
            )}
          </div>

          {/* Mật khẩu mới */}
          <div className="space-y-2">
            <label htmlFor="input-new-password" className={labelClass}>
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
                onChange={(e) => handleNewPasswordChange(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                className={`${inputBase} ${fieldErrors.newPassword ? inputError : inputNormal}`}
              />
              <button
                id="btn-toggle-new-pwd"
                type="button"
                onClick={toggleShowNew}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className="text-xs font-semibold text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fieldErrors.newPassword}</span>
              </p>
            )}
          </div>

          {/* Xác nhận mật khẩu mới */}
          <div className="space-y-2">
            <label htmlFor="input-confirm-password" className={labelClass}>
              <Lock className="w-4 h-4 text-red-500" />
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="input-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className={`${inputBase} ${fieldErrors.confirmPassword ? inputError : inputNormal}`}
              />
              <button
                id="btn-toggle-confirm-pwd"
                type="button"
                onClick={toggleShowConfirm}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs font-semibold text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fieldErrors.confirmPassword}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              id="btn-submit-change-password"
              type="submit"
              disabled={isSubmitting || !hasInput}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Cập Nhật Mật Khẩu
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
