'use client';

import { UserProfile } from '@/types/profile';

interface AccountOverviewTabProps {
  profile: UserProfile | null;
}

export default function AccountOverviewTab({ profile }: AccountOverviewTabProps) {
  const name = profile?.name || 'Người dùng';
  const email = profile?.email || '';

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Tổng Quan Tài Khoản</h2>
      </div>

      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Xin chào, bạn đang đăng nhập với tên{' '}
          <span className="font-bold text-red-500">{name}</span>
          {' '}(<span className="font-mono text-sm opacity-80">{email}</span>).
        </p>
      </div>
    </div>
  );
}
