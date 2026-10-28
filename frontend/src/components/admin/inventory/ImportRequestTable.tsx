import React from 'react';
import Image from 'next/image';
import { ImportRequest } from '@/types/import-request';
import { ImportRequestStatusBadge } from './ImportRequestStatusBadge';
import { Eye, Check, X, ShieldAlert, User, Building2, Calendar, Package } from 'lucide-react';
import { formatDateTime } from '@/utils/variant-attribute-helper';

interface ImportRequestTableProps {
  requests: ImportRequest[];
  loading: boolean;
  canApprove: boolean;
  onOpenDetail: (req: ImportRequest) => void;
  onOpenApprove: (req: ImportRequest) => void;
  onOpenReject: (req: ImportRequest) => void;
}

/**
 * Bảng hiển thị danh sách Yêu Cầu Nhập Kho
 * Tuân thủ Layer Architecture: Không chứa useState/useEffect, chỉ hiển thị dữ liệu và gọi handler
 */
export function ImportRequestTable({
  requests,
  loading,
  canApprove,
  onOpenDetail,
  onOpenApprove,
  onOpenReject,
}: ImportRequestTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">Đang tải danh sách yêu cầu nhập kho...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Không có yêu cầu nhập kho nào</h3>
        <p className="text-xs text-slate-500 mt-1">
          Chưa có yêu cầu nào phù hợp với bộ lọc hiện tại.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 font-bold text-slate-600 text-xs uppercase tracking-wider">
              <th className="p-4">Mã Yêu Cầu</th>
              <th className="p-4">Sản Phẩm</th>
              <th className="p-4">Nhà Cung Cấp</th>
              <th className="p-4">Người Gửi Đề Xuất</th>
              <th className="p-4 text-center">SL Đề Xuất</th>
              <th className="p-4 text-center">SL Thực Nhập</th>
              <th className="p-4">Ngày Tạo</th>
              <th className="p-4 text-center">Trạng Thái</th>
              <th className="p-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {requests.map((req) => {
              const isPending = req.status === 'PENDING';
              const isStaff = req.requestedByUserRole?.toUpperCase() === 'STAFF';

              return (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Mã yêu cầu */}
                  <td className="p-4 font-mono font-bold text-slate-900">
                    <span className="text-orange-600 hover:underline cursor-pointer" onClick={() => onOpenDetail(req)}>
                      {req.code}
                    </span>
                    {req.importTicketCode && (
                      <div className="text-[11px] font-mono text-emerald-600 font-normal">
                        Phiếu: {req.importTicketCode}
                      </div>
                    )}
                  </td>

                  {/* Sản phẩm */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                        {req.productMainImage ? (
                          <Image
                            src={req.productMainImage}
                            alt={req.productName}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="max-w-[220px]">
                        <p className="font-bold text-slate-900 truncate" title={req.productName}>
                          {req.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {req.items.length} biến thể
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Nhà cung cấp */}
                  <td className="p-4 text-slate-700">
                    {req.supplierName ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {req.supplierName}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Chưa xác định</span>
                    )}
                  </td>

                  {/* Người gửi đề xuất */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {req.requestedByUserName}
                        </p>
                        <span
                          className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isStaff
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {isStaff ? 'Nhân viên (Staff)' : 'Quản trị (Admin)'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Số lượng đề xuất */}
                  <td className="p-4 text-center font-bold text-slate-800">
                    {req.totalRequestedQuantity.toLocaleString('vi-VN')}
                  </td>

                  {/* Số lượng thực nhập */}
                  <td className="p-4 text-center font-bold text-emerald-600">
                    {req.totalApprovedQuantity > 0
                      ? req.totalApprovedQuantity.toLocaleString('vi-VN')
                      : '-'}
                  </td>

                  {/* Ngày tạo */}
                  <td className="p-4 text-xs text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateTime(req.createdAt)}
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="p-4 text-center">
                    <ImportRequestStatusBadge status={req.status} />
                  </td>

                  {/* Thao tác */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(req)}
                        title="Xem chi tiết"
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isPending && canApprove && (
                        <>
                          <button
                            type="button"
                            onClick={() => onOpenApprove(req)}
                            title="Kiểm đếm & Duyệt nhập kho"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Duyệt
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenReject(req)}
                            title="Từ chối yêu cầu"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

