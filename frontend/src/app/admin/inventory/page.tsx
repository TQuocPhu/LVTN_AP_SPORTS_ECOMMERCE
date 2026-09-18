import { Metadata } from 'next';
import { InventoryPageContentUI } from '@/components/admin/inventory/InventoryPageContentUI';

export const metadata: Metadata = {
  title: 'Quản Lý Kho & Kiểm Kê | AP Sports Admin',
  description: 'Quản lý tồn kho, nhập xuất kho, kiểm kê và in phiếu kho doanh nghiệp',
};

export default function InventoryPage() {
  return <InventoryPageContentUI />;
}
