'use client';

import React from 'react';
import { UserResponse } from '@/types/auth';
import { Mail, Phone, MapPin, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AdminOverviewCardProps {
  profile: UserResponse;
}

export default function AdminOverviewCard({ profile }: AdminOverviewCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
        <ShieldCheck className="w-4 h-4 text-orange-600 mr-2" />
        Thông Tin Tài Khoản
      </h4>

      <div className="space-y-3 text-sm">
        <div className="flex items-center text-slate-600">
          <Mail className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
          <span className="font-medium text-slate-900 truncate">{profile.email}</span>
        </div>

        <div className="flex items-center text-slate-600">
          <Phone className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
          <span>{profile.phoneNumber || 'Chưa cập nhật SĐT'}</span>
        </div>

        <div className="flex items-start text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400 mr-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{profile.address || 'Chưa cập nhật địa chỉ'}</span>
        </div>

        <div className="flex items-center text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
          <span>Ngày tham gia: <strong className="text-slate-800 font-semibold">{formatDate(profile.createdAt)}</strong></span>
        </div>

        <div className="flex items-center text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
          <span>Trạng thái: <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Hoạt động</span></span>
        </div>
      </div>

      {profile.permissions && profile.permissions.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Quyền Hạn Được Cấp ({profile.permissions.length})
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {profile.permissions.map((perm) => (
              <span
                key={perm}
                className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
