'use client';

import React, { useState } from 'react';
import { Building2, Plus, Search, RefreshCw } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { SupplierListTable } from './SupplierListTable';
import { SupplierFormModal } from './SupplierFormModal';
import { Supplier } from '@/types/inventory';

export default function SuppliersPageContentUI() {
  const {
    suppliers,
    loading,
    keyword,
    setKeyword,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useSuppliers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  const handleOpenCreateModal = () => {
    setSupplierToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này? Thao tác không thể hoàn tác!')) {
      await deleteSupplier(id);
    }
  };

  const handleSubmit = async (data: Parameters<typeof createSupplier>[0]) => {
    if (supplierToEdit) {
      return await updateSupplier(supplierToEdit.id, data);
    } else {
      return await createSupplier(data);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-[1536px] mx-auto">
      {/* Top Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <Building2 className="w-8 h-8 text-orange-500" />
            <span>Quản Lý Nhà Cung Cấp (Suppliers)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Quản lý thông tin đối tác phân phối & nhà sản xuất dụng cụ, đồ thể thao chính hãng
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all text-xs uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Thêm Nhà Cung Cấp</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NCC, SĐT, email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-medium focus:outline-none focus:border-orange-500"
          />
        </div>

        <button
          onClick={fetchSuppliers}
          className="p-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 text-xs font-bold shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* List Table */}
      <SupplierListTable
        suppliers={suppliers}
        loading={loading}
        onEdit={handleOpenEditModal}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        supplierToEdit={supplierToEdit}
      />
    </div>
  );
}
