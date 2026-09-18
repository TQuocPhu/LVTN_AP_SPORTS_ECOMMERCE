'use client';

import React from 'react';
import { Edit, Trash2, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Supplier } from '@/types/inventory';

interface SupplierListTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void;
}

export function SupplierListTable({
  suppliers,
  loading,
  onEdit,
  onDelete,
}: SupplierListTableProps) {
  if (loading) {
    return (
      <div className="border border-slate-200 rounded-2xl p-14 text-center bg-white text-slate-400 shadow-sm font-semibold text-sm">
        Đang tải danh sách nhà cung cấp...
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="border border-slate-200 rounded-2xl p-14 text-center bg-white text-slate-400 shadow-sm space-y-2">
        <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
        <h4 className="text-base font-bold text-slate-900">Chưa Có Nhà Cung Cấp Nào</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Hãy nhấn nút "Thêm Nhà Cung Cấp" ở trên để khởi tạo danh mục đối tác cung ứng cho kho hàng.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Mã & Tên Nhà Cung Cấp</th>
              <th className="py-4 px-6">Số Điện Thoại</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Địa Chỉ Kho Hàng</th>
              <th className="py-4 px-6 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {suppliers.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{s.name}</span>
                    </div>
                    <div className="font-mono text-xs text-slate-400">
                      Mã: <strong className="text-slate-700">{s.code}</strong>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6 font-medium text-slate-700 whitespace-nowrap">
                  {s.phone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {s.phone}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Chưa cập nhật</span>
                  )}
                </td>

                <td className="py-4 px-6 font-medium text-slate-700 whitespace-nowrap">
                  {s.email ? (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {s.email}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Chưa cập nhật</span>
                  )}
                </td>

                <td className="py-4 px-6 max-w-xs truncate font-medium text-slate-700">
                  {s.address ? (
                    <span className="flex items-center gap-1.5 truncate" title={s.address}>
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {s.address}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Chưa cập nhật</span>
                  )}
                </td>

                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(s)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa nhà cung cấp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
