'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { UserProfile, UpdateProfileRequest } from '@/types/profile';
import { Camera, User, Phone, MapPin, Save, Loader2 } from 'lucide-react';

interface AccountInfoTabProps {
  profile: UserProfile | null;
  avatarPreview: string | null;
  onUpdateProfile: (data: UpdateProfileRequest) => Promise<unknown>;
  onUploadAvatar: (file: File) => Promise<unknown>;
}

export default function AccountInfoTab({
  profile,
  avatarPreview,
  onUpdateProfile,
  onUploadAvatar,
}: AccountInfoTabProps) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhoneNumber(profile.phoneNumber || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onUploadAvatar(file);
    } catch (err) {
      console.error('Lỗi upload avatar:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await onUpdateProfile({
        name,
        phoneNumber,
        address,
      });
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const displayAvatar = avatarPreview || profile?.avatar || null;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Thông Tin Tài Khoản</h2>
        <p className="text-sm text-slate-400 mt-1">Quản lý và cập nhật thông tin cá nhân của bạn</p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-red-500/50 shadow-lg shadow-red-500/10 bg-slate-800 relative flex items-center justify-center">
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              /* Fallback: User icon khi chưa có ảnh đại diện */
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
              </div>
            )}
          </div>
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
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-lg font-semibold text-white">{profile?.name || 'Người dùng'}</h3>
          <p className="text-sm text-slate-400">{profile?.email}</p>
          <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
            {profile?.role || 'CUSTOMER'}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Họ tên */}
          <div className="space-y-2">
            <label htmlFor="input-profile-name" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4 text-red-500" />
              Họ và tên
            </label>
            <input
              id="input-profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-2">
            <label htmlFor="input-profile-email" className="text-sm font-medium text-slate-400">
              Email (Không thể thay đổi)
            </label>
            <input
              id="input-profile-email"
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <label htmlFor="input-profile-phone" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-500" />
              Số điện thoại
            </label>
            <input
              id="input-profile-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Địa chỉ cá nhân */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="input-profile-address" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              Địa chỉ liên hệ
            </label>
            <textarea
              id="input-profile-address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập số nhà, tên đường, khu vực..."
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            id="btn-save-profile"
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </div>
  );
}
