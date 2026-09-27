import { Metadata } from 'next';
import { ShipperAppPortalContentUI } from '@/components/demo/ShipperAppPortalContentUI';

export const metadata: Metadata = {
  title: 'Portal App Shipper GHN | Mô Phỏng Logistics AP Sports',
  description: 'Giao diện ứng dụng di động dành cho Shipper giao hàng & thu tiền COD',
};

export default function ShipperAppPage() {
  return <ShipperAppPortalContentUI />;
}
