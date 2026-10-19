'use client';

import React from 'react';
import { Layers, Footprints, Shirt, CircleDot, ShieldAlert } from 'lucide-react';
import {
  SHOE_SIZE_DATA,
  APPAREL_SIZE_DATA,
  FOOTBALL_SIZE_DATA,
  GLOVE_SIZE_DATA,
  SizeGuideCategoryType,
} from '@/types/size-guide';
import { useProductSizeGuideTable } from '@/hooks/useProductSizeGuideTable';

interface ProductSizeGuideTableProps {
  initialCategory?: SizeGuideCategoryType;
}

export function ProductSizeGuideTable({ initialCategory = 'shoes' }: ProductSizeGuideTableProps) {
  const { tab, setTab } = useProductSizeGuideTable(initialCategory);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          <span>Bảng Quy Đổi Kích Thước Trang Thiết Bị Thể Thao (AP Sports Size Standards)</span>
        </h3>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setTab('shoes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'shoes'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Giày</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('apparel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'apparel'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Quần Áo</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('football')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'football'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>Quả Bóng</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('gloves')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === 'gloves'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Găng Tay</span>
          </button>
        </div>
      </div>

      {/* Tab Content Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto scrollbar-thin">
        {tab === 'shoes' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">EU (Châu Âu / VN)</th>
                <th className="p-3">US (Mỹ)</th>
                <th className="p-3">UK (Anh)</th>
                <th className="p-3">Chiều Dài Bàn Chân (CM)</th>
                <th className="p-3">Inches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {SHOE_SIZE_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-slate-50/60 dark:bg-slate-950/60' : 'bg-white dark:bg-slate-900'}
                >
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white">EU {row.eu}</td>
                  <td className="p-3 font-mono">US {row.us}</td>
                  <td className="p-3 font-mono">UK {row.uk}</td>
                  <td className="p-3 font-mono font-bold text-orange-600 dark:text-orange-400">{row.cm} cm</td>
                  <td className="p-3 font-mono">{row.inches}&quot;</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'apparel' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Size Chuẩn</th>
                <th className="p-3">Chiều Cao Phù Hợp</th>
                <th className="p-3">Cân Nặng Phù Hợp</th>
                <th className="p-3">Vòng Ngực (Chest)</th>
                <th className="p-3">Vòng Eo (Waist)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {APPAREL_SIZE_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-slate-50/60 dark:bg-slate-950/60' : 'bg-white dark:bg-slate-900'}
                >
                  <td className="p-3 font-extrabold text-orange-600 dark:text-orange-400 text-sm">{row.size}</td>
                  <td className="p-3 font-medium">{row.heightCm}</td>
                  <td className="p-3 font-medium">{row.weightKg}</td>
                  <td className="p-3 font-mono">{row.chestCm}</td>
                  <td className="p-3 font-mono">{row.waistCm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'football' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Cỡ Bóng (Size)</th>
                <th className="p-3">Chu Vi Trái Bóng</th>
                <th className="p-3">Trọng Lượng Chuẩn</th>
                <th className="p-3">Lứa Tuổi Khuyên Dùng</th>
                <th className="p-3">Loại Sân Áp Dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {FOOTBALL_SIZE_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-slate-50/60 dark:bg-slate-950/60' : 'bg-white dark:bg-slate-900'}
                >
                  <td className="p-3 font-extrabold text-orange-600 dark:text-orange-400 text-sm">{row.sizeNumber}</td>
                  <td className="p-3 font-mono">{row.circumferenceCm}</td>
                  <td className="p-3 font-mono">{row.weightGrams}</td>
                  <td className="p-3 font-medium">{row.recommendedAge}</td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{row.fieldStandard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'gloves' && (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Size Găng Tay</th>
                <th className="p-3">Chiều Dài Lòng Bàn Tay</th>
                <th className="p-3">Bề Rộng Bàn Tay</th>
                <th className="p-3">Đối Tượng Phù Hợp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {GLOVE_SIZE_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-slate-50/60 dark:bg-slate-950/60' : 'bg-white dark:bg-slate-900'}
                >
                  <td className="p-3 font-extrabold text-orange-600 dark:text-orange-400 text-sm">{row.size}</td>
                  <td className="p-3 font-mono font-bold">{row.palmLengthCm}</td>
                  <td className="p-3 font-mono">{row.palmWidthCm}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{row.recommendedHand}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
