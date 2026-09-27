import { Metadata } from 'next';
import { GhnStationPortalContentUI } from '@/components/demo/GhnStationPortalContentUI';

export const metadata: Metadata = {
  title: 'Portal Bưu Cục GHN | Mô Phỏng Logistics AP Sports',
  description: 'Portal dành riêng cho Bưu cục GHN tiếp nhận kiện hàng từ Kho AP Sports',
};

export default function GhnStationPage() {
  return <GhnStationPortalContentUI />;
}
