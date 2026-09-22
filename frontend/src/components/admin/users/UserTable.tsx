import React from 'react';
import { Eye, Shield, User as UserIcon, Calendar, Mail, Phone, Lock, CheckCircle2, AlertOctagon, Clock, Building2 } from 'lucide-react';
import { UserAccount, UserPageResponse, UserStatus } from '@/types/user-management';

interface UserTableProps {
  pageData: UserPageResponse<UserAccount>;
  isLoading: boolean;
  onOpenDetailModal: (user: UserAccount) => void;
  onStatusToggle: (user: UserAccount, targetStatus: UserStatus) => void;
  onPageChange: (page: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  pageData,
  isLoading,
  onOpenDetailModal,
  onStatusToggle,
  onPageChange,
}) => {
  // Format ngày tháng
  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Render Avatar (Hình ảnh thực tế hoặc Ký tự viết tắt tên)
  const renderAvatar = (user: UserAccount) => {
    if (user.avatar && user.avatar.trim() !== '') {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
        />
      );
    }

    const initials = user.name
      ? user.name
          .split(' ')
          .map((n) => n[0])
          .slice(-2)
          .join('')
          .toUpperCase()
      : 'U';

    const isSystemAdmin = user.role === 'ADMIN';

    return (
      <div
        className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center text-white shadow-sm shrink-0 ${
          isSystemAdmin
            ? 'bg-gradient-to-tr from-amber-600 to-amber-400 border border-amber-300'
            : user.role === 'STAFF'
            ? 'bg-gradient-to-tr from-blue-600 to-blue-400'
            : user.role === 'WAREHOUSE_MANAGER'
            ? 'bg-gradient-to-tr from-purple-600 to-purple-400'
            : 'bg-gradient-to-tr from-slate-600 to-slate-400'
        }`}
      >
        {initials}
      </div>
    );
  };

  // Render Badge Vai trò
  const renderRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Quản trị viên (Admin)</span>
          </span>
        );
      case 'STAFF':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Nhân viên Staff</span>
          </span>
        );
      case 'WAREHOUSE_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Quản lý Kho</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span>Khách hàng</span>
          </span>
        );
    }
  };

  // Render Badge Trạng thái
  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Đang hoạt động</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Chờ kích hoạt</span>
          </span>
        );
      case 'banned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Đã bị khóa</span>
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>Đã xóa</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Tài khoản & Email</th>
              <th className="px-4 py-3.5">Số điện thoại</th>
              <th className="px-4 py-3.5">Vai trò</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5">Ngày tham gia</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="px-4 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                </tr>
              ))
            ) : pageData.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  <UserIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-base font-medium">Không tìm thấy tài khoản người dùng nào.</p>
                  <p className="text-xs mt-1">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm phía trên.</p>
                </td>
              </tr>
            ) : (
              pageData.content.map((user) => {
                const isAdmin = user.role === 'ADMIN';
                const isActive = user.status === 'active';
                const isPending = user.status === 'pending';

                return (
                  <tr
                    key={user.id}
                    className={`transition-colors ${
                      isAdmin
                        ? 'bg-amber-50/40 hover:bg-amber-50/80 border-l-4 border-l-amber-500 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Tên & Email & Avatar */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {renderAvatar(user)}
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.employeeCode && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] rounded border border-slate-200">
                                {user.employeeCode}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Số điện thoại */}
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                      {user.phoneNumber ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phoneNumber}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-sans italic">Chưa cập nhật</span>
                      )}
                    </td>

                    {/* Vai trò */}
                    <td className="px-4 py-3.5">
                      {renderRoleBadge(user.role)}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3.5">
                      {isAdmin ? (
                        renderStatusBadge(user.status)
                      ) : (
                        <div className="relative group inline-block">
                          <select
                            value={user.status}
                            onChange={(e) => onStatusToggle(user, e.target.value as UserStatus)}
                            className="bg-transparent border border-slate-200 hover:border-amber-400 rounded-lg px-2 py-1 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer transition-all"
                            title="Bấm để đổi nhanh trạng thái"
                          >
                            {user.status === 'pending' && (
                              <option value="pending" disabled>⏳ Chờ kích hoạt (Ban đầu)</option>
                            )}
                            <option value="active">🟢 Đang hoạt động (Active)</option>
                            <option value="banned">🔴 Đã bị khóa (Banned)</option>
                            <option value="deleted">🗑️ Đã xóa (Deleted)</option>
                          </select>
                        </div>
                      )}
                    </td>

                    {/* Ngày tạo */}
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>

                    {/* Thao tác (Admin không có nút thao tác) */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 select-none">
                            <Lock className="w-3 h-3" />
                            <span>Quản trị tối cao</span>
                          </span>
                        ) : (
                          <>
                            {/* Nút Thanh trượt Toggle Bật/Tắt Trạng thái */}
                            <button
                              type="button"
                              onClick={() => {
                                if (isPending) {
                                  onStatusToggle(user, 'active');
                                } else {
                                  onStatusToggle(user, isActive ? 'banned' : 'active');
                                }
                              }}
                              title={
                                isPending
                                  ? 'Kích hoạt tài khoản ngay (Xóa token trong DB)'
                                  : isActive
                                  ? 'Khóa tài khoản (Banned)'
                                  : 'Kích hoạt lại tài khoản (Active)'
                              }
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isActive
                                  ? 'bg-emerald-500'
                                  : isPending
                                  ? 'bg-amber-400'
                                  : 'bg-rose-500'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Nút Xem chi tiết */}
                            <button
                              onClick={() => onOpenDetailModal(user)}
                              title="Xem chi tiết tài khoản & địa chỉ"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {!isLoading && pageData.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs sm:text-sm">
          <div className="text-slate-500">
            Hiển thị <span className="font-semibold text-slate-700">{pageData.number * pageData.size + 1}</span> -{' '}
            <span className="font-semibold text-slate-700">
              {Math.min((pageData.number + 1) * pageData.size, pageData.totalElements)}
            </span>{' '}
            trong tổng số <span className="font-semibold text-slate-700">{pageData.totalElements}</span> tài khoản
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={pageData.first}
              onClick={() => onPageChange(pageData.number - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-3 py-1.5 font-medium text-slate-700">
              {pageData.number + 1} / {pageData.totalPages}
            </span>
            <button
              disabled={pageData.last}
              onClick={() => onPageChange(pageData.number + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
