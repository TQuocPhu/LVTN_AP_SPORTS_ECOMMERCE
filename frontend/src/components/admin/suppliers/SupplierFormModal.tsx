'use client';

import React, { useState, useEffect } from 'react';
import { X, Building2, Phone, Mail, MapPin, Code } from 'lucide-react';
import { Supplier, SupplierRequest } from '@/types/inventory';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierRequest) => Promise<boolean>;
  supplierToEdit?: Supplier | null;
}

export function SupplierFormModal({
  isOpen,
  onClose,
  onSubmit,
  supplierToEdit,
}: SupplierFormModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.name || '');
      setCode(supplierToEdit.code || '');
      setPhone(supplierToEdit.phone || '');
      setEmail(supplierToEdit.email || '');
      setAddress(supplierToEdit.address || '');
    } else {
      setName('');
      setCode('');
      setPhone('');
      setEmail('');
      setAddress('');
    }
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setSubmitting(true);
    const success = await onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
    });
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden space-y-6 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-orange-600" />
            <span>{supplierToEdit ? 'Chỉnh Sửa Nhà Cung Cấp' : 'Thêm Nhà Cung Cấp Mới'}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-orange-500" />
              <span>Tên nhà cung cấp <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nike Vietnam, Adidas Global, Kamito Sports..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-orange-500" />
              <span>Mã nhà cung cấp <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: SUP-NIKE-01, SUP-ADI-02..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono font-bold placeholder:text-slate-400 uppercase focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>Số điện thoại</span>
              </label>
              <input
                type="text"
                placeholder="0988xxx..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-orange-500" />
                <span>Email liên hệ</span>
              </label>
              <input
                type="email"
                placeholder="supplier@brand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Địa chỉ trụ sở / Kho hàng</span>
            </label>
            <textarea
              rows={3}
              placeholder="Nhập địa chỉ nhà cung cấp..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !code.trim()}
              className="px-7 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/20 transition-all"
            >
              {submitting ? 'Đang Lưu...' : supplierToEdit ? 'Cập Nhật' : 'Tạo Nhà Cung Cấp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
