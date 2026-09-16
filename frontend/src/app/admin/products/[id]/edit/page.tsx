'use client';

import React, { use } from 'react';
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
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = Number(resolvedParams.id);
  const router = useRouter();

  const form = useProductForm(productId);
  const { categoryTree } = useCategories();

  const handleFinalSubmit = async () => {
    try {
      await form.submitForm();
      toast.success('Cập nhật sản phẩm thành công!');
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Lỗi khi cập nhật sản phẩm:', err);
    }
  };

  if (form.loading) {
    return (
      <div className="p-12 text-center text-slate-500 max-w-xl mx-auto space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500" />
        <p className="font-semibold text-base">Đang tải thông tin sản phẩm chỉnh sửa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Top Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Chỉnh Sửa Sản Phẩm #{productId}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cập nhật thông tin chi tiết, hình ảnh và biến thể sản phẩm AP Sports.
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
            mainImage={form.mainImage}
            errors={form.errors}
            onNameChange={form.setName}
            onCategoryIdsChange={form.setCategoryIds}
            onPriceChange={form.setPrice}
            onUnitChange={form.setUnit}
            onMainImageChange={form.setMainImage}
          />
        )}

        {form.activeStep === 1 && (
          <ProductFormDescriptionStep
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
            isEdit={true}
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
            isEdit={true}
            name={form.name}
            slug={form.slug}
            price={form.price}
            unit={form.unit}
            mainImage={form.mainImage}
            categoryIds={form.categoryIds}
            variants={form.variants}
          />
        )}
      </div>

      {/* Footer Navigation Bar */}
      <ProductFormFooterNav
        activeStep={form.activeStep}
        isEdit={true}
        submitting={form.submitting}
        onPrevStep={form.prevStep}
        onNextStep={form.nextStep}
        onSubmit={handleFinalSubmit}
      />
    </div>
  );
}
