import React from 'react';
import { Layers, Truck } from 'lucide-react';

interface VoucherCategoryTabsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

/**
 * Danh sách các Tab phân loại Voucher chính (Tất cả sản phẩm & Miễn phí vận chuyển)
 */
const TABS = [
  { id: 'ALL', label: 'Tất Cả Voucher', icon: Layers },
  { id: 'FREESHIP', label: 'Miễn Phí Vận Chuyển', icon: Truck },
];

/**
 * Component VoucherCategoryTabs: Thanh chuyển đổi Tab danh mục Kho Voucher.
 * Tích hợp 100% Light và Dark mode.
 */
export const VoucherCategoryTabs: React.FC<VoucherCategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-3 mb-6 no-scrollbar">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = selectedCategory === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectCategory(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-500'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
