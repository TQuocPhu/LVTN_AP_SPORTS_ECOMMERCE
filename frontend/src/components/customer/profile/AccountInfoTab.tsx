"use client";

import { UserProfile, UpdateProfileRequest } from "@/types/profile";
import { useAccountInfoForm } from "@/hooks/useAccountInfoForm";
import {
  Camera,
  User,
  Phone,
  MapPin,
  Save,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

interface AccountInfoTabProps {
  profile: UserProfile | null;
  avatarPreview: string | null;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<unknown>;
  onUploadAvatar: (file: File) => Promise<unknown>;
}

/**
 * Component hiển thị và chỉnh sửa Thông tin tài khoản cá nhân (AccountInfoTab).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Không sử dụng useState / useEffect trong Component.
 * - Toàn bộ trạng thái form và kiểm tra quyền hạn tài khoản Google nằm tại `useAccountInfoForm`.
 */
export default function AccountInfoTab({
  profile,
  avatarPreview,
  onUpdateProfile,
  onUploadAvatar,
}: AccountInfoTabProps) {
  const {
    name,
    phoneNumber,
    address,
    fieldErrors,
    isUpdating,
    isUploading,
    isGoogleAccount,
    hasChanged,
    displayAvatar,
    handleNameChange,
    handlePhoneChange,
    handleAddressChange,
    handleAvatarChange,
    handleSubmit,
  } = useAccountInfoForm({
    profile,
    avatarPreview,
    onUpdateProfile,
    onUploadAvatar,
  });

  // Shared input class
  const inputBase =
    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors";
  const inputNormal =
    "border-slate-300 dark:border-slate-800 focus:border-red-500 dark:focus:border-red-500";
  const inputError = "border-red-500 focus:border-red-500";
  const inputDisabled =
    "w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60 text-slate-400 cursor-not-allowed";
  const labelClass =
    "text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2";

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Thông Tin Tài Khoản
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quản lý và cập nhật thông tin cá nhân của bạn
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-red-500/50 shadow-lg shadow-red-500/10 bg-slate-200 dark:bg-slate-800 relative flex items-center justify-center">
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt="Avatar preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-slate-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              </div>
            )}
          </div>

          {/* Chỉ hiển thị nút chọn ảnh đại diện nếu KHÔNG phải tài khoản Google */}
          {!isGoogleAccount && (
            <label
              htmlFor="avatar-upload-input"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-red-600 hover:bg-red-500 text-white cursor-pointer shadow-md transition-all hover:scale-110"
              title="Đổi ảnh đại diện"
            >
              <Camera className="w-4 h-4" />
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        <div className="text-center sm:text-left space-y-1.5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {profile?.name || "Người dùng"}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {profile?.email}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 uppercase">
              {profile?.role || "CUSTOMER"}
            </span>
            {isGoogleAccount && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Đã liên kết Google (Ảnh & Tên đồng bộ từ Google)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Họ tên */}
          <div className="space-y-2">
            <label
              htmlFor="input-profile-name"
              className={
                isGoogleAccount
                  ? "text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"
                  : labelClass
              }
            >
              <User className="w-4 h-4 text-red-500" />
              {isGoogleAccount
                ? "Họ và tên (Đồng bộ từ Google)"
                : "Họ và tên"}
            </label>
            <input
              id="input-profile-name"
              type="text"
              required={!isGoogleAccount}
              disabled={isGoogleAccount}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className={
                isGoogleAccount
                  ? inputDisabled
                  : `${inputBase} ${fieldErrors.name ? inputError : inputNormal}`
              }
            />
            {fieldErrors.name && (
              <p className="text-xs font-semibold text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-2">
            <label
              htmlFor="input-profile-email"
              className="text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              Email (Không thể thay đổi)
            </label>
            <input
              id="input-profile-email"
              type="email"
              disabled
              value={profile?.email || ""}
              className={inputDisabled}
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <label htmlFor="input-profile-phone" className={labelClass}>
              <Phone className="w-4 h-4 text-red-500" />
              Số điện thoại
            </label>
            <input
              id="input-profile-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Nhập số điện thoại"
              className={`${inputBase} ${fieldErrors.phoneNumber ? inputError : inputNormal}`}
            />
            {fieldErrors.phoneNumber && (
              <p className="text-xs font-semibold text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fieldErrors.phoneNumber}</span>
              </p>
            )}
          </div>

          {/* Địa chỉ */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="input-profile-address" className={labelClass}>
              <MapPin className="w-4 h-4 text-red-500" />
              Địa chỉ liên hệ
            </label>
            <textarea
              id="input-profile-address"
              rows={3}
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Nhập số nhà, tên đường, khu vực..."
              className={`${inputBase} resize-none ${fieldErrors.address ? inputError : inputNormal}`}
            />
            {fieldErrors.address && (
              <p className="text-xs font-semibold text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{fieldErrors.address}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            id="btn-save-profile"
            type="submit"
            disabled={isUpdating || !hasChanged}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </div>
  );
}
