import { useState, useCallback } from 'react';
import { adminAiController } from '@/controllers/admin-ai-controller';
import { AiProductContentRequest } from '@/types/ai';

/**
 * Custom Hook quản lý tính năng AI Product Content Creator (Agent 2) trên Form thêm/sửa sản phẩm
 * Tách biệt hoàn toàn logic ra khỏi Component.
 */
export function useProductAiContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAiDescription = useCallback(
    async (
      productInfo: AiProductContentRequest,
      onSuccess: (html: string, seoTitle?: string, metaDesc?: string) => void
    ) => {
      if (!productInfo.productName || productInfo.productName.trim().length < 3) {
        alert('Vui lòng nhập Tên sản phẩm (ít nhất 3 ký tự) để AI có cơ sở sinh nội dung chuẩn xác.');
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const res = await adminAiController.generateProductDescription(productInfo);
        if (res?.data?.htmlContent) {
          // Chuẩn hóa HTML: chuyển đổi **text** thành <strong>text</strong> chuẩn HTML cho RichTextEditor
          const cleanHtml = res.data.htmlContent
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*\*/g, '')
            .trim();

          const cleanTitle = res.data.seoTitle ? res.data.seoTitle.replace(/\*\*/g, '').trim() : undefined;
          const cleanDesc = res.data.metaDescription ? res.data.metaDescription.replace(/\*\*/g, '').trim() : undefined;

          onSuccess(cleanHtml, cleanTitle, cleanDesc);
        } else {
          setError('Không nhận được nội dung từ AI. Vui lòng thử lại.');
        }
      } catch (err: any) {
        setError(err?.message || 'Lỗi khi gọi AI sinh nội dung.');
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    isGenerating,
    error,
    handleGenerateAiDescription,
  };
}
