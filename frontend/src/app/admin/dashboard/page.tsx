import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tổng Quan (Dashboard) - AP SPORTS Admin',
  description: 'Trang tổng quan quản trị hệ thống AP SPORTS',
};

export default function AdminDashboardPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[500px] flex flex-col justify-center items-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Trang Tổng Quan (Dashboard)</h2>
      <p className="text-sm text-gray-500 max-w-md">
        Nội dung bảng điều khiển thống kê tổng quan hệ thống đang được chuẩn bị cho các bước tiếp theo.
      </p>
    </div>
  );
}
