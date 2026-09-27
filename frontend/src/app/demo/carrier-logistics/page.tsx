import { Metadata } from 'next';
import { CarrierLogisticsPortalContentUI } from '@/components/demo/CarrierLogisticsPortalContentUI';

export const metadata: Metadata = {
  title: 'Portal Trung Tâm Vận Chuyển GHN | Mô Phỏng Logistics AP Sports',
  description: 'Portal trung tâm điều hành xe tải vận chuyển GHN Transit Hub',
};

export default function CarrierLogisticsPage() {
  return <CarrierLogisticsPortalContentUI />;
}
