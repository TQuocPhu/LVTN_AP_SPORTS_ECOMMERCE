import React from 'react';
import { X, User, MapPin, Mail, Phone, Calendar, Shield, CheckCircle2, Clock, Building2, AlertOctagon } from 'lucide-react';
import { UserAccount } from '@/types/user-management';

interface UserDetailModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  isLoading: boolean;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  user,
  isLoading,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác thực / Không có';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>🟢 Đang hoạt động</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>⏳ Chờ kích hoạt</span>
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>🔴 Đã bị khóa</span>
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>🗑️ Đã xóa</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col transition-all">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900">
                Chi tiết tài khoản [{user.name}]
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem toàn bộ thông tin cá nhân và danh sách địa chỉ nhận hàng của người dùng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-sm">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 animate-pulse space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto"></div>
              <p>Đang tải thông tin chi tiết tài khoản...</p>
            </div>
          ) : (
            <>
              {/* Thẻ Thông tin cá nhân cơ bản */}
              <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 font-bold text-2xl flex items-center justify-center text-white shadow-md border border-amber-200 shrink-0">
                    {user.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(-2)
                          .join('')
                          .toUpperCase()
                      : 'U'}
                  </div>
                )}

                {/* Thông tin chính */}
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="font-bold text-lg text-slate-900">{user.name}</h4>
                    {user.role === 'ADMIN' && (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300 inline-flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-600" />
                        Quản trị tối cao
                      </span>
                    )}
                    {user.role === 'STAFF' && (
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                        Nhân viên Staff
                      </span>
                    )}
                    {user.role === 'WAREHOUSE_MANAGER' && (
                      <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full border border-purple-200">
                        Quản lý Kho
                      </span>
                    )}
                    {user.role === 'CUSTOMER' && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200">
                        Khách hàng
                      </span>
                    )}
                    {/* Badge Trạng Thái Tài Khoản */}
                    {renderStatusBadge(user.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{user.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{user.phoneNumber || 'Chưa có số điện thoại'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>Tham gia: {formatDate(user.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Email xác thực: {formatDate(user.emailVerifiedAt)}</span>
                    </div>
                  </div>

                  {user.employeeCode && (
                    <div className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold rounded-lg">
                      Mã định danh nhân viên: {user.employeeCode}
                    </div>
                  )}
                </div>
              </div>

              {/* Danh sách Địa chỉ giao hàng */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>Danh sách địa chỉ nhận hàng ({user.addresses?.length || 0})</span>
                </div>

                {!user.addresses || user.addresses.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                    Người dùng này chưa tạo địa chỉ giao hàng nào trên hệ thống.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl border transition-all text-xs space-y-1.5 ${
                          addr.isDefault
                            ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{addr.fullName}</span>
                            <span className="font-mono text-slate-500">({addr.phone})</span>
                          </div>
                          {addr.isDefault && (
                            <span className="px-2.5 py-0.5 bg-amber-500 text-white font-semibold text-[10px] rounded-full">
                              Địa chỉ mặc định
                            </span>
                          )}
                        </div>

                        <div className="text-slate-600">
                          {addr.address}, {addr.city}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end px-8 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
