'use client';

import { useState } from 'react';
import { ShippingAddress, ShippingAddressRequest } from '@/types/address';
import { MapPin, Plus, CheckCircle, Edit3, Trash2, Phone, User, Loader2 } from 'lucide-react';
import AddressModal from './AddressModal';

interface ShippingAddressesTabProps {
  addresses: ShippingAddress[];
  loading: boolean;
  onCreateAddress: (data: ShippingAddressRequest) => Promise<unknown>;
  onUpdateAddress: (id: number, data: ShippingAddressRequest) => Promise<unknown>;
  onDeleteAddress: (id: number) => Promise<unknown>;
  onSetDefaultAddress: (id: number) => Promise<unknown>;
}

export default function ShippingAddressesTab({
  addresses,
  loading,
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}: ShippingAddressesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<ShippingAddress | null>(null);

  const handleOpenAddModal = () => {
    setAddressToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: ShippingAddress) => {
    setAddressToEdit(addr);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (data: ShippingAddressRequest) => {
    if (addressToEdit) {
      await onUpdateAddress(addressToEdit.id, data);
    } else {
      await onCreateAddress(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa địa chỉ giao hàng này?')) {
      await onDeleteAddress(id);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Địa Chỉ Giao Hàng</h2>
          <p className="text-sm text-slate-400 mt-1">Quản lý các địa chỉ nhận hàng để thanh toán nhanh chóng hơn</p>
        </div>

        <button
          id="btn-open-add-address-modal"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Thêm Địa Chỉ Mới
        </button>
      </div>

      {loading && addresses.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 p-8 rounded-2xl bg-slate-950/40 border border-slate-800/60 space-y-3">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-base">Bạn chưa có địa chỉ giao hàng nào.</p>
          <button
            id="btn-add-first-address"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Thêm địa chỉ ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                addr.isDefault
                  ? 'bg-slate-950/80 border-red-500/50 shadow-md shadow-red-500/5'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-semibold text-white text-base flex items-center gap-1.5">
                    <User className="w-4 h-4 text-red-500" />
                    {addr.fullName}
                  </span>
                  <span className="text-slate-400 text-sm flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {addr.phone}
                  </span>
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      Mặc định
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!addr.isDefault && (
                    <button
                      id={`btn-set-default-address-${addr.id}`}
                      onClick={() => onSetDefaultAddress(addr.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                  <button
                    id={`btn-edit-address-${addr.id}`}
                    onClick={() => handleOpenEditModal(addr)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Chỉnh sửa địa chỉ"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-address-${addr.id}`}
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Xóa địa chỉ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-slate-300 space-y-1">
                <p className="font-medium text-slate-200">{addr.address}</p>
                <p className="text-slate-400 text-xs">{addr.city}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={addressToEdit}
        onSave={handleSaveAddress}
      />
    </div>
  );
}
