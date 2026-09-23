'use client';

import React from 'react';
import { useAdminProfile } from '@/hooks/useAdminProfile';
import AdminAvatarCard from './AdminAvatarCard';
import AdminOverviewCard from './AdminOverviewCard';
import AdminInfoTab from './AdminInfoTab';
import AdminChangePasswordTab from './AdminChangePasswordTab';
import { User, KeyRound, Shield, Loader2 } from 'lucide-react';

export default function AdminProfileContentUI() {
  const {
    profile,
    loading,
    updating,
    avatarPreview,
    activeTab,
    setActiveTab,
    updateProfile,
    uploadAvatar,
    changePassword,
  } = useAdminProfile();

  if (loading || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">Đang tải hồ sơ cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Hồ Sơ Cá Nhân
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật thông tin cá nhân, ảnh đại diện Cloudinary và bảo mật mật khẩu tài khoản quản trị.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Overview */}
        <div className="lg:col-span-4 space-y-6">
          <AdminAvatarCard
            avatarUrl={avatarPreview || profile.avatar || null}
            name={profile.name}
            roleName={profile.roleName}
            updating={updating}
            onAvatarSelect={uploadAvatar}
          />
          <AdminOverviewCard profile={profile} />
        </div>

        {/* Right Column: Tabbed Forms */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 bg-slate-50/50">
              <button
                type="button"
                id="admin-profile-info-tab-btn"
                onClick={() => setActiveTab('info')}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition ${
                  activeTab === 'info'
                    ? 'border-orange-600 text-orange-600 bg-white shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Thông Tin Cá Nhân</span>
              </button>

              <button
                type="button"
                id="admin-profile-password-tab-btn"
                onClick={() => setActiveTab('password')}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-bold border-b-2 transition ${
                  activeTab === 'password'
                    ? 'border-orange-600 text-orange-600 bg-white shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Đổi Mật Khẩu</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6">
              {activeTab === 'info' ? (
                <AdminInfoTab
                  profile={profile}
                  updating={updating}
                  onUpdate={updateProfile}
                />
              ) : (
                <AdminChangePasswordTab
                  updating={updating}
                  onChangePassword={changePassword}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
