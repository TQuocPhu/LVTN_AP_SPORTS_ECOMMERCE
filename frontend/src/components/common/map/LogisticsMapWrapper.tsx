'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LogisticsMap = dynamic(
  () => import('./LogisticsMap').then((mod) => mod.LogisticsMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[360px] bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3 animate-pulse">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Đang khởi tạo bản đồ vận chuyển GPS Leaflet...</p>
      </div>
    ),
  }
);

export function LogisticsMapWrapper(props: React.ComponentProps<typeof LogisticsMap>) {
  return <LogisticsMap {...props} />;
}
