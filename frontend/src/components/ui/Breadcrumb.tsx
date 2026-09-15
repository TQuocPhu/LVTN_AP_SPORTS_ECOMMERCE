'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Component Breadcrumbs Tái Sử Dụng Độc Lập Cho Mọi Trang.
 * Thiết kế gọn gàng dạng Pill Badge mờ kính (Glassmorphism), dễ dàng gọi ở bất kỳ đâu với danh sách items khác nhau.
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="inline-flex items-center space-x-2 text-sm text-slate-300 bg-slate-900/70 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/60 shadow-lg">
      <Link href="/" className="flex items-center hover:text-orange-400 transition-colors font-medium">
        <Home className="w-4 h-4 mr-1.5 text-slate-400" />
        Trang chủ
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {item.href ? (
            <Link href={item.href} className="hover:text-orange-400 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-orange-400">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
