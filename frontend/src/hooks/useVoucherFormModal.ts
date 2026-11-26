'use client';

import { useState, useEffect, useCallback } from 'react';
import { Voucher, VoucherFormData, VoucherType } from '@/types/voucher';
import { formatToLocalDatetimeInput } from '@/utils/formatters';

interface UseVoucherFormModalParams {
  isOpen: boolean;
  editingVoucher: Voucher | null;
  onSubmit: (formData: VoucherFormData) => void;
}

/**
 * Hook quản lý toàn bộ trạng thái và kiểm tra hợp lệ của Modal Thêm mới / Chỉnh sửa Voucher,
 * đảm bảo Component VoucherFormModal hoàn toàn thuần giao diện (không chứa useState / useEffect).
 */
export function useVoucherFormModal({
  isOpen,
  editingVoucher,
  onSubmit,
}: UseVoucherFormModalParams) {
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
      const activeVal =
        editingVoucher.isActive ?? editingVoucher.active ?? editingVoucher.status !== 'disabled';
      setFormData({
        code: editingVoucher.code || '',
        name: editingVoucher.name || '',
        description: editingVoucher.description || '',
        type: editingVoucher.type || 'FIXED',
        value:
          editingVoucher.value !== undefined && editingVoucher.value !== null
            ? editingVoucher.value
            : ('' as any),
        maxDiscountAmount:
          editingVoucher.maxDiscountAmount !== undefined &&
          editingVoucher.maxDiscountAmount !== null
            ? editingVoucher.maxDiscountAmount
            : ('' as any),
        minOrderValue:
          editingVoucher.minOrderValue !== undefined && editingVoucher.minOrderValue !== null
            ? editingVoucher.minOrderValue
            : ('' as any),
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

  const handleTypeSelect = useCallback((selectedType: VoucherType) => {
    const autoScope = selectedType === 'FREESHIP' ? 'FREESHIP' : 'ALL';
    setFormData((prev) => ({
      ...prev,
      type: selectedType,
      categoryScope: autoScope,
      maxDiscountAmount: selectedType === 'PERCENT' ? prev.maxDiscountAmount : ('' as any),
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
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
        setValidationError(
          'Số lượt dùng tối đa / 1 tài khoản không được vượt quá Tổng số lượt phát hành toàn sàn.'
        );
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
        maxDiscountAmount:
          formData.type !== 'FIXED' && formData.maxDiscountAmount
            ? Number(formData.maxDiscountAmount)
            : undefined,
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
      });
    },
    [formData, onSubmit]
  );

  return {
    formData,
    setFormData,
    validationError,
    handleTypeSelect,
    handleSubmit,
  };
}
