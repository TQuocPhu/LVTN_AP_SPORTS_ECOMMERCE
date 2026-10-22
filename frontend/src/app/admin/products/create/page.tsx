'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProductForm } from '@/hooks/useProductForm';
import { useCategories } from '@/hooks/useCategories';
import { ProductFormStepHeader } from '@/components/admin/product/ProductFormStepHeader';
import { ProductFormBasicStep } from '@/components/admin/product/ProductFormBasicStep';
import { ProductFormDescriptionStep } from '@/components/admin/product/ProductFormDescriptionStep';
import { ProductFormVariantStep } from '@/components/admin/product/ProductFormVariantStep';
import { ProductFormReviewStep } from '@/components/admin/product/ProductFormReviewStep';
import { ProductFormFooterNav } from '@/components/admin/product/ProductFormFooterNav';
import { StockTicketPrintModal } from '@/components/admin/inventory/StockTicketPrintModal';
import { InventoryTransaction } from '@/types/inventory';
import { ArrowLeft, CheckCircle2, Printer, ArrowRight, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const router = useRouter();
  const form = useProductForm();
  const { categoryTree } = useCategories();

  // State for Inbound Stock Receipt printing
  const [createdTransaction, setCreatedTransaction] = useState<InventoryTransaction | null>(null);
  const [createdTicketCode, setCreatedTicketCode] = useState<string | null>(null);
  const [createdProductName, setCreatedProductName] = useState<string>('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);

  const handleFinalSubmit = async () => {
    try {
      const res = await form.submitForm();
      const productData = res?.data;

      if (productData?.initialImportTransaction) {
        setCreatedTransaction(productData.initialImportTransaction);
        setCreatedTicketCode(productData.initialImportTicketCode || null);
        setCreatedProductName(productData.name || form.name);
        setShowSuccessDialog(true);
        toast.success(`Tạo sản phẩm & phiếu nhập kho ${productData.initialImportTicketCode} thành công!`);
      } else {
        toast.success('Thêm sản phẩm mới thành công!');
        router.push('/admin/products');
      }
    } catch (err: any) {
      console.error('Lỗi khi thêm sản phẩm:', err);
    }
  };

  const selectedSupplierName = form.suppliers.find((s) => s.id === form.supplierId)?.name;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Top Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Thêm Sản Phẩm Mới
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập sản phẩm mới với ma trận biến thể đa thuộc tính và quản lý nhập kho tập trung.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-sm rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Trở về danh sách
        </Link>
      </div>

      {/* Step Progress Wizard Header */}
      <ProductFormStepHeader
        activeStep={form.activeStep}
        onStepClick={(step) => form.setActiveStep(step)}
      />

      {/* Step Forms */}
      <div className="py-4">
        {form.activeStep === 0 && (
          <ProductFormBasicStep
            name={form.name}
            slug={form.slug}
            categoryIds={form.categoryIds}
            categoryTree={categoryTree}
            price={form.price}
            unit={form.unit}
            weight={form.weight}
            mainImage={form.mainImage}
            errors={form.errors}
            onNameChange={form.setName}
            onCategoryIdsChange={form.setCategoryIds}
            onPriceChange={form.setPrice}
            onUnitChange={form.setUnit}
            onWeightChange={form.setWeight}
            onMainImageChange={form.setMainImage}
          />
        )}

        {form.activeStep === 1 && (
          <ProductFormDescriptionStep
            productName={form.name}
            description={form.description}
            specifications={form.specifications}
            onDescriptionChange={form.setDescription}
            onAddSpecRow={() =>
              form.setSpecifications([...form.specifications, { key: '', value: '' }])
            }
            onRemoveSpecRow={(idx) =>
              form.setSpecifications(form.specifications.filter((_, i) => i !== idx))
            }
            onSpecChange={(idx, field, val) => {
              const updated = [...form.specifications];
              updated[idx][field] = val;
              form.setSpecifications(updated);
            }}
          />
        )}

        {form.activeStep === 2 && (
          <ProductFormVariantStep
            isEdit={false}
            canCreateImport={form.canCreateImport}
            hasInitialStock={form.hasInitialStock}
            setHasInitialStock={form.setHasInitialStock}
            supplierId={form.supplierId}
            setSupplierId={form.setSupplierId}
            importNote={form.importNote}
            setImportNote={form.setImportNote}
            suppliers={form.suppliers}
            loadingSuppliers={form.loadingSuppliers}
            attributeGroups={form.attributeGroups}
            variants={form.variants}
            errors={form.errors}
            onAddGroup={form.addAttributeGroup}
            onRemoveGroup={form.removeAttributeGroup}
            onAddValue={form.addAttributeValue}
            onRemoveValue={form.removeAttributeValue}
            onAddVariantRow={form.addVariantRow}
            onUpdateVariant={form.updateVariant}
            onRemoveVariant={form.removeVariant}
          />
        )}

        {form.activeStep === 3 && (
          <ProductFormReviewStep
            isEdit={false}
            name={form.name}
            slug={form.slug}
            price={form.price}
            unit={form.unit}
            mainImage={form.mainImage}
            categoryIds={form.categoryIds}
            variants={form.variants}
            hasInitialStock={form.hasInitialStock}
            supplierName={selectedSupplierName}
            importNote={form.importNote}
          />
        )}
      </div>

      {/* Footer Navigation Bar */}
      <ProductFormFooterNav
        activeStep={form.activeStep}
        isEdit={false}
        submitting={form.submitting}
        onPrevStep={form.prevStep}
        onNextStep={form.nextStep}
        onSubmit={handleFinalSubmit}
      />

      {/* Post-Creation Success Dialog with Print Ticket Action */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <PackageCheck className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Thêm Sản Phẩm Thành Công!
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sản phẩm <strong>{createdProductName}</strong> đã được lưu. Hệ thống đã tự động lập Phiếu Nhập Kho{' '}
                <strong className="text-emerald-700 font-mono">{createdTicketCode}</strong> vào sổ cái kho.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all hover:scale-[1.01]"
              >
                <Printer className="w-4 h-4" /> In Phiếu Nhập Kho (Khổ A4)
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Về danh sách sản phẩm <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Ticket Printable Document Modal */}
      <StockTicketPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          router.push('/admin/products');
        }}
        transaction={createdTransaction}
      />
    </div>
  );
}
