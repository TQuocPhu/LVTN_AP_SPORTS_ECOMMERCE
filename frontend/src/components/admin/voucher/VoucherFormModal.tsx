import React, { useState, useEffect } from 'react';
import { X, Tag, AlertCircle, Info } from 'lucide-react';
import { Voucher, VoucherFormData, VoucherType } from '@/types/voucher';
import { formatToLocalDatetimeInput } from '@/utils/formatters';

interface VoucherFormModalProps {
  isOpen: boolean;
  editingVoucher: Voucher | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (formData: VoucherFormData) => void;
}

/**
 * Component VoucherFormModal: Modal Thêm mới hoặc Chỉnh sửa thông tin Mã Giảm Giá cho Admin.
 * Tự động đồng bộ Phạm vi áp dụng theo Loại Mã Giảm Giá (FREESHIP -> Phí Vận Chuyển, PERCENT/FIXED -> Tất Cả Sản Phẩm).
 */
export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  isOpen,
  editingVoucher,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    name: '',
    description: '',
    type: 'FIXED',
    value: '' as any,
    maxDiscountAmount: '' as any,
    minOrderValue: '' as any,
    usageLimit: 100,
    userUsageLimit: 1,
    categoryScope: 'ALL',
    startsAt: '',
    expiresAt: '',
    isActive: true,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (editingVoucher) {
      const autoScope = editingVoucher.type === 'FREESHIP' ? 'FREESHIP' : 'ALL';
      const activeVal = editingVoucher.isActive ?? editingVoucher.active ?? (editingVoucher.status !== 'disabled');
      setFormData({
        code: editingVoucher.code || '',
        name: editingVoucher.name || '',
        description: editingVoucher.description || '',
        type: editingVoucher.type || 'FIXED',
        value: editingVoucher.value !== undefined && editingVoucher.value !== null ? editingVoucher.value : ('' as any),
        maxDiscountAmount: editingVoucher.maxDiscountAmount !== undefined && editingVoucher.maxDiscountAmount !== null ? editingVoucher.maxDiscountAmount : ('' as any),
        minOrderValue: editingVoucher.minOrderValue !== undefined && editingVoucher.minOrderValue !== null ? editingVoucher.minOrderValue : ('' as any),
        usageLimit: editingVoucher.usageLimit ?? 100,
        userUsageLimit: editingVoucher.userUsageLimit ?? 1,
        categoryScope: autoScope,
        startsAt: formatToLocalDatetimeInput(editingVoucher.startsAt),
        expiresAt: formatToLocalDatetimeInput(editingVoucher.expiresAt),
        isActive: activeVal,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'FIXED',
        value: '' as any,
        maxDiscountAmount: '' as any,
        minOrderValue: '' as any,
        usageLimit: 100,
        userUsageLimit: 1,
        categoryScope: 'ALL',
        startsAt: formatToLocalDatetimeInput(new Date()),
        expiresAt: '',
        isActive: true,
      });
    }
    setValidationError(null);
  }, [editingVoucher, isOpen]);

  if (!isOpen) return null;

  /**
   * Thay đổi loại mã giảm giá (FIXED, PERCENT, FREESHIP).
   * Tự động đặt categoryScope phù hợp:
   * - FREESHIP => 'FREESHIP' (Miễn phí vận chuyển)
   * - FIXED / PERCENT => 'ALL' (Tất cả sản phẩm)
   */
  const handleTypeSelect = (selectedType: VoucherType) => {
    const autoScope = selectedType === 'FREESHIP' ? 'FREESHIP' : 'ALL';
    const autoMaxDiscount = selectedType === 'PERCENT' ? formData.maxDiscountAmount : ('' as any);

    setFormData((prev) => ({
      ...prev,
      type: selectedType,
      categoryScope: autoScope,
      maxDiscountAmount: autoMaxDiscount,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.code.trim()) {
      setValidationError('Vui lòng nhập Mã giảm giá (VD: APSSUMMER50).');
      return;
    }

    if (!formData.name.trim()) {
      setValidationError('Vui lòng nhập Tên hiển thị voucher.');
      return;
    }

    const numValue = Number(formData.value);
    if (isNaN(numValue) || numValue <= 0) {
      setValidationError('Giá trị giảm phải là một số lớn hơn 0.');
      return;
    }

    if (formData.type === 'PERCENT' && numValue > 100) {
      setValidationError('Tỷ lệ giảm theo phần trăm không được vượt quá 100%.');
      return;
    }

    if (formData.startsAt && formData.expiresAt) {
      const start = new Date(formData.startsAt);
      const end = new Date(formData.expiresAt);
      if (start >= end) {
        setValidationError('Thời gian bắt đầu hiệu lực phải nhỏ hơn thời gian hết hạn.');
        return;
      }
    }

    if (
      formData.usageLimit &&
      formData.userUsageLimit &&
      Number(formData.userUsageLimit) > Number(formData.usageLimit)
    ) {
      setValidationError('Số lượt dùng tối đa / 1 tài khoản không được vượt quá Tổng số lượt phát hành toàn sàn.');
      return;
    }

    const finalScope = formData.type === 'FREESHIP' ? 'FREESHIP' : 'ALL';

    onSubmit({
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      type: formData.type,
      categoryScope: finalScope,
      value: numValue,
      maxDiscountAmount: formData.type !== 'FIXED' && formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
      minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col transition-all">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900">
                {editingVoucher ? `Chỉnh sửa mã giảm giá [${editingVoucher.code}]` : 'Thêm mã giảm giá / Voucher mới'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingVoucher ? 'Cập nhật các thông số điều kiện của chương trình khuyến mãi' : 'Tạo mới mã khuyến mãi giảm tiền, giảm % hoặc miễn phí vận chuyển'}
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Thông báo lỗi validation */}
          {validationError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Nhóm 1: Mã Code & Tên Hiển Thị */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mã Giảm Giá (Code) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code ?? ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: FREESHIP30K, APSSUMMER50"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Viết liền không dấu, hệ thống tự động chuyển thành chữ in hoa.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tên hiển thị Voucher <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name ?? ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Giảm 15% Đơn Từ 300.000đ"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Tên ngắn gọn hiển thị cho khách hàng xem trên Kho Voucher.</p>
            </div>
          </div>

          {/* Mô tả điều kiện */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mô tả chi tiết điều kiện áp dụng
            </label>
            <textarea
              rows={2}
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập hướng dẫn hoặc ghi chú thêm (VD: Áp dụng cho tất cả đồ thể thao nam nữ)..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Nhóm 2: Loại Voucher & Cơ chế Giảm giá */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <Info className="w-4 h-4 text-amber-500" />
                <span>Cấu hình Giá trị giảm & Trần giảm giá tối đa</span>
              </div>

              {/* Tự động hiển thị phạm vi áp dụng */}
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                {formData.type === 'FREESHIP'
                  ? 'Phạm vi: Áp dụng Phí Vận Chuyển'
                  : 'Phạm vi: Áp dụng Phí Tiền Hàng'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Loại Voucher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại Mã Giảm Giá <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.type ?? 'FIXED'}
                  onChange={(e) => handleTypeSelect(e.target.value as VoucherType)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="FIXED">Giảm tiền cố định (VNĐ)</option>
                  <option value="PERCENT">Giảm theo phần trăm (%)</option>
                  <option value="FREESHIP">Miễn phí vận chuyển (FREESHIP)</option>
                </select>
              </div>

              {/* Giá trị giảm chính */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {formData.type === 'PERCENT'
                    ? 'Tỷ lệ giảm giá (%)'
                    : formData.type === 'FREESHIP'
                    ? 'Số tiền ship hỗ trợ giảm (VNĐ)'
                    : 'Số tiền giảm cố định (VNĐ)'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={formData.type === 'PERCENT' ? 100 : undefined}
                  placeholder={
                    formData.type === 'PERCENT'
                      ? 'VD: 15 (Giảm 15%)'
                      : formData.type === 'FREESHIP'
                      ? 'VD: 30000 (Giảm 30.000đ ship)'
                      : 'VD: 50000 (Giảm 50.000đ)'
                  }
                  value={formData.value !== undefined && formData.value !== null ? formData.value : ''}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value ? Number(e.target.value) : ('' as any) })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Mức giảm giá tối đa - Tiêu đề & placeholder linh hoạt theo Loại Voucher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {formData.type === 'PERCENT'
                    ? 'Mức % giảm tối đa (%)'
                    : formData.type === 'FREESHIP'
                    ? 'Mức giảm tối đa (Không áp dụng)'
                    : 'Mức giảm tối đa (Không áp dụng)'}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  disabled={formData.type !== 'PERCENT'}
                  placeholder={
                    formData.type === 'PERCENT'
                      ? 'VD: 50 (Khống chế tối đa 50%)'
                      : formData.type === 'FREESHIP'
                      ? 'Tự động giảm đúng tiền ship'
                      : 'Không áp dụng cho tiền cố định'
                  }
                  value={formData.maxDiscountAmount !== undefined && formData.maxDiscountAmount !== null ? formData.maxDiscountAmount : ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscountAmount: e.target.value ? Number(e.target.value) : ('' as any),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Hướng dẫn giải thích cơ chế giảm giá */}
            <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-600 leading-relaxed">
              {formData.type === 'PERCENT' && (
                <p>
                  💡 <strong>Cơ chế giảm theo Phần trăm (%):</strong> Hệ thống giảm <strong>{formData.value || 0}%</strong> tổng giá trị đơn hàng.
                  {formData.maxDiscountAmount && Number(formData.maxDiscountAmount) > 0 ? (
                    <span> Mức giảm được khống chế trần tối đa là <strong>{formData.maxDiscountAmount}%</strong>.</span>
                  ) : (
                    <span> Giảm đúng {formData.value || 0}% mà không bị giới hạn tối đa.</span>
                  )}
                </p>
              )}
              {formData.type === 'FIXED' && (
                <p>
                  💡 <strong>Cơ chế giảm Tiền cố định:</strong> Trừ trực tiếp <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.value || 0))}</strong> thẳng vào tổng tiền đơn hàng của khách.
                </p>
              )}
              {formData.type === 'FREESHIP' && (
                <p>
                  💡 <strong>Cơ chế giảm Phí Vận Chuyển:</strong> Trừ tối đa <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.value || 0))}</strong> trực tiếp vào phí vận chuyển của đơn hàng.
                </p>
              )}
            </div>
          </div>

          {/* Nhóm 3: Điều kiện Đơn tối thiểu, Tổng số lượt & Số lượt / 1 tài khoản */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá trị đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                placeholder="VD: 200000 (Đơn từ 200.000đ)"
                value={formData.minOrderValue !== undefined && formData.minOrderValue !== null ? formData.minOrderValue : ''}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value ? Number(e.target.value) : ('' as any) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Khách phải mua đơn từ mức này trở lên mới áp được mã.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tổng số lượt phát hành toàn sàn
              </label>
              <input
                type="number"
                min={1}
                value={formData.usageLimit !== undefined && formData.usageLimit !== null ? formData.usageLimit : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usageLimit: e.target.value ? Number(e.target.value) : ('' as any),
                  })
                }
                placeholder="VD: 100 lượt"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Để trống nếu không giới hạn tổng số lượt dùng.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số lượt dùng tối đa / 1 Tài khoản
              </label>
              <input
                type="number"
                min={1}
                value={formData.userUsageLimit !== undefined && formData.userUsageLimit !== null ? formData.userUsageLimit : 1}
                onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value ? Number(e.target.value) : 1 })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định 1 tài khoản chỉ áp dụng mã này 1 lần.</p>
            </div>
          </div>

          {/* Nhóm 4: Checkbox Kích hoạt */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer select-none p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-xl w-full">
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-800">
                Kích hoạt mã ngay sau khi lưu (Cho phép khách hàng thấy & áp mã trên toàn hệ thống)
              </span>
            </label>
          </div>

          {/* Nhóm 5: Thời gian Bắt đầu & Hết hạn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian Bắt đầu có hiệu lực
              </label>
              <input
                type="datetime-local"
                value={formData.startsAt ?? ''}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thời gian Hết hạn sử dụng (Để trống nếu Vĩnh viễn)
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt ?? ''}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Footer Nút Hủy & Lưu */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : editingVoucher ? 'Cập nhật mã giảm giá' : 'Tạo mới voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
