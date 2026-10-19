'use client';

import React from 'react';
import {
  Ruler,
  X,
  Footprints,
  Shirt,
  CircleDot,
  ShieldAlert,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import {
  SizeGuideCategoryType,
  SHOE_SIZE_DATA,
  APPAREL_SIZE_DATA,
  FOOTBALL_SIZE_DATA,
  GLOVE_SIZE_DATA,
} from '@/types/size-guide';

interface ProductSizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCategory: SizeGuideCategoryType;
  onSelectCategory: (cat: SizeGuideCategoryType) => void;
  footLength: string;
  onFootLengthChange: (val: string) => void;
  recommendedShoeSize: string | null;
  userHeight: string;
  onUserHeightChange: (val: string) => void;
  userWeight: string;
  onUserWeightChange: (val: string) => void;
  recommendedApparelSize: string | null;
}

export function ProductSizeGuideModal({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  footLength,
  onFootLengthChange,
  recommendedShoeSize,
  userHeight,
  onUserHeightChange,
  userWeight,
  onUserWeightChange,
  recommendedApparelSize,
}: ProductSizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all z-10 flex flex-col">
        {/* Header Gradient */}
        <div className="relative bg-gradient-to-r from-slate-900 via-orange-950 to-orange-900 p-6 text-white border-b border-orange-500/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shadow-inner">
              <Ruler className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-400 block">
                AP Sports Size Finder
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Bảng Hướng Dẫn Kích Thước & Đo Size Chuẩn Xác
              </h2>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mt-5">
            <button
              type="button"
              onClick={() => onSelectCategory('shoes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeCategory === 'shoes'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Footprints className="w-4 h-4" />
              <span>Giày Đá Bóng (38 - 45)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCategory('apparel')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeCategory === 'apparel'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Shirt className="w-4 h-4" />
              <span>Quần Áo Thể Thao (S - 3XL)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCategory('football')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeCategory === 'football'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <CircleDot className="w-4 h-4" />
              <span>Quả Bóng Đá (Size 3, 4, 5)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCategory('gloves')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeCategory === 'gloves'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Găng Tay Thủ Môn (Size 7 - 10)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* ========================================================================= */}
          {/* TAB 1: GIÀY ĐÁ BÓNG */}
          {/* ========================================================================= */}
          {activeCategory === 'shoes' && (
            <div className="space-y-6">
              {/* Smart Size Calculator Giày */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800/80 dark:to-orange-950/30 border border-orange-200 dark:border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1.5 max-w-sm">
                  <div className="flex items-center gap-2 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Máy Tính Size Giày Thông Minh</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nhập chiều dài bàn chân từ gót đến ngón dài nhất để nhận ngay đề xuất size giày chuẩn xác nhất.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="number"
                      step="0.1"
                      min="22"
                      max="31"
                      value={footLength}
                      onChange={(e) => onFootLengthChange(e.target.value)}
                      className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Centimet (cm)</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-md">
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      Size Giày Phù Hợp:
                    </span>
                    <span className="text-3xl font-black text-orange-600 dark:text-orange-400">
                      EU {recommendedShoeSize || '--'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Bảng Kích Thước Giày */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">EU (Châu Âu / VN)</th>
                      <th className="p-3">US (Mỹ)</th>
                      <th className="p-3">UK (Anh)</th>
                      <th className="p-3">Chiều Dài Bàn Chân (CM)</th>
                      <th className="p-3">Inches</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {SHOE_SIZE_DATA.map((row, idx) => {
                      const isHighlighted = recommendedShoeSize === row.eu;
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-orange-500/15 dark:bg-orange-500/25 font-bold text-orange-600 dark:text-orange-400'
                              : idx % 2 === 0
                              ? 'bg-slate-50/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <td className="p-3 font-extrabold">EU {row.eu}</td>
                          <td className="p-3">US {row.us}</td>
                          <td className="p-3">UK {row.uk}</td>
                          <td className="p-3 font-mono font-bold">{row.cm} cm</td>
                          <td className="p-3 font-mono">{row.inches}&quot;</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Hướng dẫn cách đo chân */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-orange-500" />
                  <span>Cách Đo Chiều Dài Bàn Chân Tại Nhà Chuẩn Xác:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  <li>Đặt một tờ giấy trắng A4 sát mép tường trên sàn nhà phẳng.</li>
                  <li>Đứng thẳng, đặt gót chân chạm nhẹ vào tường và bàn chân vuông góc trên mặt giấy.</li>
                  <li>Dùng bút đánh dấu điểm xa nhất của ngón chân dài nhất (ngón cái hoặc ngón trỏ).</li>
                  <li>Dùng thước đo khoảng cách từ mép tường đến điểm đánh dấu và cộng thêm 0.5cm nếu có bàn chân bè ngang.</li>
                </ol>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: QUẦN ÁO THỂ THAO */}
          {/* ========================================================================= */}
          {activeCategory === 'apparel' && (
            <div className="space-y-6">
              {/* Smart Size Calculator Quần Áo */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800/80 dark:to-orange-950/30 border border-orange-200 dark:border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-2 max-w-sm">
                  <div className="flex items-center gap-2 text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Gợi Ý Size Quần Áo Nhanh</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Chiều cao (cm):
                      </label>
                      <input
                        type="number"
                        min="140"
                        max="210"
                        value={userHeight}
                        onChange={(e) => onUserHeightChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Cân nặng (kg):
                      </label>
                      <input
                        type="number"
                        min="35"
                        max="140"
                        value={userWeight}
                        onChange={(e) => onUserWeightChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-md">
                  <div className="text-right">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                      Size Áo Đề Xuất:
                    </span>
                    <span className="text-3xl font-black text-orange-600 dark:text-orange-400">
                      Size {recommendedApparelSize || '--'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Bảng Kích Thước Quần Áo */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Size Chuẩn</th>
                      <th className="p-3">Chiều Cao Phù Hợp</th>
                      <th className="p-3">Cân Nặng Phù Hợp</th>
                      <th className="p-3">Vòng Ngực (Chest)</th>
                      <th className="p-3">Vòng Eo (Waist)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {APPAREL_SIZE_DATA.map((row, idx) => {
                      const isHighlighted = recommendedApparelSize === row.size;
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-orange-500/15 dark:bg-orange-500/25 font-bold text-orange-600 dark:text-orange-400'
                              : idx % 2 === 0
                              ? 'bg-slate-50/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <td className="p-3 font-extrabold text-sm">{row.size}</td>
                          <td className="p-3 font-medium">{row.heightCm}</td>
                          <td className="p-3 font-medium">{row.weightKg}</td>
                          <td className="p-3 font-mono">{row.chestCm}</td>
                          <td className="p-3 font-mono">{row.waistCm}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: QUẢ BÓNG ĐÁ TIÊU CHUẨN FIFA */}
          {/* ========================================================================= */}
          {activeCategory === 'football' && (
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Cỡ Bóng (Size)</th>
                      <th className="p-3">Chu Vi Trái Bóng</th>
                      <th className="p-3">Trọng Lượng Chuẩn</th>
                      <th className="p-3">Lứa Tuổi Khuyên Dùng</th>
                      <th className="p-3">Loại Sân Áp Dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {FOOTBALL_SIZE_DATA.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          idx % 2 === 0
                            ? 'bg-slate-50/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }
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
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: GĂNG TAY THỦ MÔN */}
          {/* ========================================================================= */}
          {activeCategory === 'gloves' && (
            <div className="space-y-6">
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Size Găng Tay</th>
                      <th className="p-3">Chiều Dài Lòng Bàn Tay</th>
                      <th className="p-3">Bề Rộng Bàn Tay</th>
                      <th className="p-3">Đối Tượng Phù Hợp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {GLOVE_SIZE_DATA.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          idx % 2 === 0
                            ? 'bg-slate-50/60 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }
                      >
                        <td className="p-3 font-extrabold text-orange-600 dark:text-orange-400 text-sm">{row.size}</td>
                        <td className="p-3 font-mono font-bold">{row.palmLengthCm}</td>
                        <td className="p-3 font-mono">{row.palmWidthCm}</td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{row.recommendedHand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
