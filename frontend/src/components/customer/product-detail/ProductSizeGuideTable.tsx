'use client';

import React from 'react';
import { Layers } from 'lucide-react';

interface SizeGuideRow {
  brandSize: string;
  heelToToeInches: string;
  heelToToeCm: string;
}

const SIZE_GUIDE_DATA: SizeGuideRow[] = [
  { brandSize: '1 Infant', heelToToeInches: '3.2"', heelToToeCm: '8.1 cm' },
  { brandSize: '2 Infant', heelToToeInches: '3.5"', heelToToeCm: '8.9 cm' },
  { brandSize: '3 Infant', heelToToeInches: '3.9"', heelToToeCm: '9.9 cm' },
  { brandSize: '4 Infant', heelToToeInches: '4.2"', heelToToeCm: '10.7 cm' },
  { brandSize: '5 Infant', heelToToeInches: '4.5"', heelToToeCm: '11.4 cm' },
  { brandSize: '6 Infant', heelToToeInches: '5.0"', heelToToeCm: '12.7 cm' },
  { brandSize: '7 Toddler', heelToToeInches: '5.4"', heelToToeCm: '13.7 cm' },
  { brandSize: '8 Toddler', heelToToeInches: '5.7"', heelToToeCm: '14.5 cm' },
  { brandSize: '9 Toddler', heelToToeInches: '6.0"', heelToToeCm: '15.2 cm' },
  { brandSize: '10 Toddler', heelToToeInches: '6.3"', heelToToeCm: '16.0 cm' },
  { brandSize: '11 Little Kid', heelToToeInches: '6.7"', heelToToeCm: '17.0 cm' },
  { brandSize: '12 Little Kid', heelToToeInches: '7.0"', heelToToeCm: '17.8 cm' },
  { brandSize: '13 Little Kid', heelToToeInches: '7.4"', heelToToeCm: '18.8 cm' },
  { brandSize: '1 Little Kid', heelToToeInches: '7.7"', heelToToeCm: '19.6 cm' },
  { brandSize: '2 Little Kid', heelToToeInches: '8.0"', heelToToeCm: '20.3 cm' },
  { brandSize: '3.5 Big Kid (36 EU)', heelToToeInches: '8.5"', heelToToeCm: '21.6 cm' },
  { brandSize: '4 Big Kid (36.5 EU)', heelToToeInches: '8.7"', heelToToeCm: '22.1 cm' },
  { brandSize: '4.5 Big Kid (37 EU)', heelToToeInches: '8.9"', heelToToeCm: '22.6 cm' },
  { brandSize: '5 Big Kid (38 EU)', heelToToeInches: '9.0"', heelToToeCm: '22.9 cm' },
  { brandSize: '5.5 Big Kid (38.5 EU)', heelToToeInches: '9.2"', heelToToeCm: '23.4 cm' },
  { brandSize: '6 Big Kid (39 EU)', heelToToeInches: '9.4"', heelToToeCm: '23.9 cm' },
  { brandSize: '6.5 Big Kid (40 EU)', heelToToeInches: '9.5"', heelToToeCm: '24.1 cm' },
  { brandSize: '7 Big Kid (40.5 EU)', heelToToeInches: '9.7"', heelToToeCm: '24.6 cm' },
  { brandSize: '7.5 Big Kid (41 EU)', heelToToeInches: '9.8"', heelToToeCm: '24.9 cm' },
];

export function ProductSizeGuideTable() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          <span>Bảng Quy Đổi Kích Thước (US Unisex Size Chart)</span>
        </h3>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[420px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider sticky top-0 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Kích thước (Brand Size)</th>
              <th className="p-3">Chiều dài bàn chân (Inches)</th>
              <th className="p-3">Chiều dài bàn chân (CM)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {SIZE_GUIDE_DATA.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-slate-50/60 dark:bg-slate-950/60' : 'bg-white dark:bg-slate-900'}
              >
                <td className="p-3 font-bold text-slate-900 dark:text-white">{row.brandSize}</td>
                <td className="p-3 font-mono">{row.heelToToeInches}</td>
                <td className="p-3 font-mono font-semibold text-orange-600 dark:text-orange-400">{row.heelToToeCm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
