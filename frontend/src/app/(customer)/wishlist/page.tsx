import { Metadata } from 'next';
import ClientTopBar from '@/components/layout/ClientTopBar';
import WishlistPageContentUI from '@/components/customer/wishlist/WishlistPageContentUI';

export const metadata: Metadata = {
  title: 'Danh Sách Yêu Thích | AP Sports Store',
  description: 'Quản lý danh sách dụng cụ, trang phục thể thao yêu thích của bạn tại AP Sports Store.',
};

export default function WishlistPage() {
  return (
    <>
      {/* Thanh thông tin định vị, email & mạng xã hội đầu trang (Desktop Client) */}
      <ClientTopBar />
      <WishlistPageContentUI />
    </>
  );
}
