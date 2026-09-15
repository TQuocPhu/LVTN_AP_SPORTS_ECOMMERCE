'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAddresses } from '@/hooks/useAddresses';

import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import AccountOverviewTab from './AccountOverviewTab';
import AccountInfoTab from './AccountInfoTab';
import ChangePasswordTab from './ChangePasswordTab';
import ShippingAddressesTab from './ShippingAddressesTab';

import {
  User,
  UserCheck,
  Lock,
  MapPin,
  LogOut,
  Loader2,
} from 'lucide-react';

import ConfirmLogoutModal from '@/components/ui/ConfirmLogoutModal';

type ActiveTab = 'overview' | 'info' | 'password' | 'addresses';

export default function AccountPageShell() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const {
    profile,
    loading: profileLoading,
    avatarPreview,
    updateProfile,
    uploadAvatar,
    changePassword,
  } = useProfile();

  const {
    addresses,
    loading: addressLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  /**
   * Đăng xuất: gọi API logout → hard redirect về trang chủ ngay lập tức.
   * Dùng window.location.href thay vì router.push để ép browser gửi request
   * HTTP mới, đảm bảo middleware Edge nhận diện cookie đã bị xóa ngay.
   */
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const navItems = [
    {
      id: 'tab-nav-overview',
      key: 'overview' as ActiveTab,
      label: 'Tài khoản',
      icon: User,
    },
    {
      id: 'tab-nav-info',
      key: 'info' as ActiveTab,
      label: 'Thông tin tài khoản',
      icon: UserCheck,
    },
    {
      id: 'tab-nav-password',
      key: 'password' as ActiveTab,
      label: 'Thay đổi mật khẩu',
      icon: Lock,
    },
    {
      id: 'tab-nav-addresses',
      key: 'addresses' as ActiveTab,
      label: 'Địa chỉ giao hàng',
      icon: MapPin,
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Header Banner chuẩn – dùng component PageHeaderBanner chung với trang login ── */}
      <PageHeaderBanner
        title="TÀI KHOẢN"
        breadcrumbs={[{ label: 'Tài khoản' }]}
      />

      {/* ── Khu vực nội dung chính ── */}
      <div
        className="flex-1"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">
          {authLoading || profileLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* ── Sidebar Navigation ── */}
              <div className="lg:col-span-1 space-y-2">
                <nav
                  className="p-3 rounded-2xl border backdrop-blur-xl shadow-xl space-y-1"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--background) 80%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
                  }}
                >
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.key;
                    return (
                      <button
                        key={item.key}
                        id={item.id}
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all text-left ${
                          isActive
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                            : 'opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/5'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-red-500'}`}
                        />
                        {item.label}
                      </button>
                    );
                  })}

                  {/* Nút Đăng xuất */}
                  <div
                    className="border-t mt-2 pt-2"
                    style={{ borderColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)' }}
                  >
                    <button
                      id="tab-nav-logout"
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500 flex-shrink-0" />
                      Đăng xuất
                    </button>
                  </div>
                </nav>
              </div>

              {/* ── Nội dung Tab động ── */}
              <div className="lg:col-span-3">
                {activeTab === 'overview' && (
                  <AccountOverviewTab profile={profile || (user as never)} />
                )}

                {activeTab === 'info' && (
                  <AccountInfoTab
                    profile={profile || (user as never)}
                    avatarPreview={avatarPreview}
                    onUpdateProfile={updateProfile}
                    onUploadAvatar={uploadAvatar}
                  />
                )}

                {activeTab === 'password' && (
                  <ChangePasswordTab onChangePassword={changePassword} />
                )}

                {activeTab === 'addresses' && (
                  <ShippingAddressesTab
                    addresses={addresses}
                    loading={addressLoading}
                    onCreateAddress={createAddress}
                    onUpdateAddress={updateAddress}
                    onDeleteAddress={deleteAddress}
                    onSetDefaultAddress={setDefaultAddress}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Glassmorphic Logout Confirmation Modal */}
      <ConfirmLogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
