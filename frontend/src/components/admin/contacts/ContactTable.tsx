'use client';

import React from 'react';
import { Contact } from '@/types/contact';
import {
  Search,
  Filter,
  RefreshCw,
  Mail,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Reply,
  User,
  Phone,
  ArrowUpDown,
} from 'lucide-react';

interface ContactTableProps {
  contacts: Contact[];
  loading: boolean;
  totalElements: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  keyword: string;
  onKeywordChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortDir: 'DESC' | 'ASC';
  onSortDirChange: (dir: 'DESC' | 'ASC') => void;
  onOpenReplyModal: (contact: Contact) => void;
  onRefresh: () => void;
}

export function ContactTable({
  contacts,
  loading,
  totalElements,
  page,
  pageSize,
  onPageChange,
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  sortDir,
  onSortDirChange,
  onOpenReplyModal,
  onRefresh,
}: ContactTableProps) {
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Tên, Email, SĐT, Nội dung..."
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
            >
              <option value="ALL">-- Tất cả trạng thái --</option>
              <option value="pending">Chờ xử lý (Pending)</option>
              <option value="replied">Đã phản hồi (Replied)</option>
            </select>
          </div>

          {/* Time Sort Filter (Newest / Oldest) */}
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <select
              value={sortDir}
              onChange={(e) => onSortDirChange(e.target.value as 'DESC' | 'ASC')}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
            >
              <option value="DESC">Mới nhất (Muộn nhất)</option>
              <option value="ASC">Sớm nhất (Cũ nhất)</option>
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
          title="Làm mới danh sách"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">#</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Thông Tin Người Gửi</th>
                <th className="py-3.5 px-4">Nội Dung Thắc Mắc</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Thời Gian Gửi</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-orange-500" />
                    Đang tải danh sách liên hệ khách hàng...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 font-medium">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    Không tìm thấy yêu cầu liên hệ nào phù hợp.
                  </td>
                </tr>
              ) : (
                contacts.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-bold text-xs text-slate-400">
                      {page * pageSize + idx + 1}
                    </td>

                    {/* Customer Sender Info */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-orange-500" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Message Snippet */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="text-xs text-slate-700 font-medium line-clamp-2" title={c.message}>
                        "{c.message}"
                      </div>
                      {c.status === 'replied' && c.repliedByName && (
                        <div className="text-[10px] text-slate-400 italic pt-0.5">
                          Đã trả lời bởi <strong>{c.repliedByName}</strong>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {c.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          <span>Chờ xử lý</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Đã phản hồi</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(c.createdAt)}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onOpenReplyModal(c)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all shadow-2xs ${
                          c.status === 'pending'
                            ? 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        <Reply className="w-3.5 h-3.5 text-orange-500" />
                        <span>{c.status === 'pending' ? 'Phản hồi Email' : 'Xem phản hồi'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500">
          <div>
            Hiển thị <strong className="text-slate-900">{contacts.length}</strong> trên tổng số <strong className="text-slate-900">{totalElements}</strong> yêu cầu
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-slate-800">
              Trang {page + 1} / {totalPages}
            </span>

            <button
              disabled={page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
