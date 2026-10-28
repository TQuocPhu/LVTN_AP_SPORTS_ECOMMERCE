import React from 'react';
import { ImportRequestStatus } from '@/types/import-request';
import { Search, RefreshCw, Clock, PackageCheck, XCircle, Layers } from 'lucide-react';

interface ImportRequestHeaderProps {
  pendingCount: number;
  statusFilter: ImportRequestStatus | 'ALL';
  setStatusFilter: (status: ImportRequestStatus | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  loading: boolean;
  onRefresh: () => void;
  totalElements: number;
}

/**
 * Header & Bộ lọc danh sách Yêu Cầu Nhập Kho
 * Tuân thủ Layer Architecture: Không useState/useEffect
 */
export function ImportRequestHeader({
  pendingCount,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  loading,
  onRefresh,
  totalElements,
}: ImportRequestHeaderProps) {
  const tabs: { key: ImportRequestStatus | 'ALL'; label: string; icon: any; count?: number }[] = [
    { key: 'ALL', label: 'Tất cả yêu cầu', icon: Layers, count: totalElements },
    { key: 'PENDING', label: 'Chờ phê duyệt', icon: Clock, count: pendingCount },
    { key: 'COMPLETED', label: 'Đã nhập kho', icon: PackageCheck },
    { key: 'REJECTED', label: 'Bị từ chối', icon: XCircle },
  ];

  return (
    <div className="space-y-4">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Yêu Cầu Nhập Kho
            </h1>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {pendingCount} yêu cầu chờ duyệt
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tiếp nhận, kiểm đếm thực tế và phê duyệt các đề xuất nhập hàng từ Nhân viên và Quản trị viên
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Tabs Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = statusFilter === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatusFilter(t.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã YCNK, sản phẩm, người gửi..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}

