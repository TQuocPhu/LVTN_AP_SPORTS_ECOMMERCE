import React, { useState, useEffect } from 'react';
import { X, UserPlus, Info, AlertCircle, Key } from 'lucide-react';
import { CreateStaffFormData } from '@/types/user-management';

interface CreateStaffModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateStaffFormData) => void;
}

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateStaffFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'STAFF',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        role: 'STAFF',
      });
      setValidationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.name.trim()) {
      setValidationError('Vui lòng nhập họ và tên nhân viên.');
      return;
    }

    if (!formData.email.trim()) {
      setValidationError('Vui lòng nhập địa chỉ email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setValidationError('Địa chỉ email không đúng định dạng.');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber?.trim() || undefined,
      role: formData.role,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col transition-all">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900">
                Tạo mới tài khoản nhân viên
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Khởi tạo tài khoản Nhân viên bán hàng hoặc Quản lý kho
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

        {/* Thông báo Mật khẩu Mặc định ngay bên dưới dòng tiêu đề Modal */}
        <div className="px-8 pt-5">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
            <Key className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">
                🔑 Mật khẩu mặc định hệ thống:
              </p>
              <code className="inline-block font-mono text-amber-900 font-bold bg-amber-200/80 px-2 py-0.5 rounded text-xs mt-1 border border-amber-300 select-all">
                APSport@123&gt;5&lt;108-10-24-0408
              </code>
              <p className="text-[11px] text-amber-800 mt-1">
                Tài khoản khởi tạo sẽ tự động được gán trạng thái <strong>Đang hoạt động (Active)</strong> và xác nhận email ngay lập tức. Nhân viên dùng email và mật khẩu mặc định này để đăng nhập.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-5 flex-1 text-sm">
          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Họ tên nhân viên */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Họ và tên nhân viên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Nguyễn Văn Nhân"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Địa chỉ Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="VD: staff.nv01@apsports.vn"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Số điện thoại liên hệ
            </label>
            <input
              type="tel"
              value={formData.phoneNumber ?? ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="VD: 0987654321"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Chọn Vai Trò */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Vai trò tài khoản <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="STAFF">Nhân viên bán hàng</option>
              <option value="WAREHOUSE_MANAGER">Quản lý kho</option>
            </select>
          </div>

          {/* Footer Nút bấm */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang khởi tạo...' : 'Tạo mới nhân viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
