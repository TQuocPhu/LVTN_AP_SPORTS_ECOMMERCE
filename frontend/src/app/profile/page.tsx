import AccountPageShell from '@/components/profile/AccountPageShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tài Khoản Cá Nhân | AP Sports',
  description: 'Quản lý thông tin tài khoản, hồ sơ cá nhân, đổi mật khẩu và địa chỉ giao hàng.',
};

export default function ProfilePage() {
  return <AccountPageShell />;
}
