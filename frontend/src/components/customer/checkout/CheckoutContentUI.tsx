'use client';

import React, { useState } from 'react';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutAddressSection } from './CheckoutAddressSection';
import { AddressSelectModal } from './AddressSelectModal';
import { CheckoutItemsSection } from './CheckoutItemsSection';
import { CheckoutPaymentMethodSection } from './CheckoutPaymentMethodSection';
import { CheckoutVoucherSection } from './CheckoutVoucherSection';
import { CheckoutSummarySection } from './CheckoutSummarySection';
import { CheckoutSEOTrustBadges } from './CheckoutSEOTrustBadges';
import AddressModal from '../profile/AddressModal';
import { addressController } from '@/controllers/address-controller';
import { ShippingAddressRequest } from '@/types/address';

export default function CheckoutContentUI() {
  const {
    addresses,
    selectedAddress,
    loadingAddresses,
    loadingShippingFee,
    isAddressSelectModalOpen,
    setIsAddressSelectModalOpen,
    setSelectedAddress,
    refetchAddresses,
    cartItems,
    loadingCart,
    paymentMethod,
    setPaymentMethod,
    voucherCode,
    setVoucherCode,
    appliedVoucher,
    applyingVoucher,
    voucherError,
    handleApplyVoucher,
    handleRemoveVoucher,
    note,
    setNote,
    summary,
    isSubmittingOrder,
    handlePlaceOrder,
  } = useCheckout();

  // State cho Modal Thêm Địa Chỉ Mới trực tiếp từ Checkout
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);

  const handleSaveNewAddress = async (data: ShippingAddressRequest) => {
    try {
      const res = await addressController.createAddress(data);
      if (res.data) {
        await refetchAddresses();
        setSelectedAddress(res.data);
        setIsAddAddressModalOpen(false);
      }
    } catch {
      // apiClient handles error toast automatically
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16 transition-colors">
      {/* Header Banner Standard Component */}
      <PageHeaderBanner
        title="ĐẶT HÀNG & THANH TOÁN"
        subtitle="Kiểm tra thông tin giao hàng, áp dụng mã ưu đãi và hoàn tất đơn hàng AP Sports Enterprise"
        breadcrumbs={[
          { label: 'Giỏ hàng', href: '/cart' },
          { label: 'Đặt hàng' },
        ]}
      />

      {/* Main Container */}
      <main className="max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 mt-8 flex-1 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Info, Cart Items, Payment Method, Voucher */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* 1. Address Section */}
            <CheckoutAddressSection
              selectedAddress={selectedAddress}
              loading={loadingAddresses}
              onOpenSelectModal={() => setIsAddressSelectModalOpen(true)}
            />

            {/* 2. Cart Items List */}
            <CheckoutItemsSection items={cartItems} loading={loadingCart} />

            {/* 3. Payment Method Selector */}
            <CheckoutPaymentMethodSection
              paymentMethod={paymentMethod}
              onSelectPaymentMethod={setPaymentMethod}
            />

            {/* 4. Voucher Section */}
            <CheckoutVoucherSection
              voucherCode={voucherCode}
              setVoucherCode={setVoucherCode}
              appliedVoucher={appliedVoucher}
              applying={applyingVoucher}
              error={voucherError}
              onApply={handleApplyVoucher}
              onRemove={handleRemoveVoucher}
            />
          </div>

          {/* Right Column: Order Summary & Trust Badges (Sticky Panel) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 sticky top-24">
            <CheckoutSummarySection
              summary={summary}
              note={note}
              setNote={setNote}
              isSubmitting={isSubmittingOrder}
              loadingShippingFee={loadingShippingFee}
              onPlaceOrder={handlePlaceOrder}
            />

            {/* SEO Trust Guarantees Cards Vertical */}
            <CheckoutSEOTrustBadges />
          </div>
        </div>
      </main>

      {/* Modal 1: Select Address Modal */}
      <AddressSelectModal
        isOpen={isAddressSelectModalOpen}
        onClose={() => setIsAddressSelectModalOpen(false)}
        addresses={addresses}
        selectedAddress={selectedAddress}
        onSelectAddress={setSelectedAddress}
        onAddNewAddress={() => {
          setIsAddressSelectModalOpen(false);
          setIsAddAddressModalOpen(true);
        }}
      />

      {/* Modal 2: Add New Address Modal (Reusable AddressModal) */}
      <AddressModal
        isOpen={isAddAddressModalOpen}
        onClose={() => setIsAddAddressModalOpen(false)}
        addressToEdit={null}
        onSave={handleSaveNewAddress}
      />
    </div>
  );
}
