'use client';

import { useState, useEffect } from 'react';
import { categoryController } from '@/controllers/category-controller';
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

interface UseCategoryFormProps {
  editingCategory?: CategoryResponse | null;
  presetParentId?: number | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function useCategoryForm({
  editingCategory,
  presetParentId,
  onSuccess,
  onClose,
}: UseCategoryFormProps) {
  const isEdit = !!editingCategory;

  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [parentId, setParentId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when editing or resetting
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name || '');
      setSlug(editingCategory.slug || '');
      setDescription(editingCategory.description || '');
      setImage(editingCategory.image || '');
      setParentId(editingCategory.parentId || null);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImage('');
      setParentId(presetParentId !== undefined ? presetParentId : null);
    }
    setErrors({});
  }, [editingCategory, presetParentId]);

  // When parentId changes to non-null (i.e. becoming a subcategory), clear image
  const handleParentIdChange = (id: number | null) => {
    setParentId(id);
    if (id !== null) {
      // Clear image when converting to subcategory because images are only allowed for root categories
      setImage('');
    }
  };

  // Auto-generate slug from name on creation
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      const baseSlug = val
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      if (baseSlug) {
        const uid5 = Math.random().toString(36).substring(2, 7); // Exactly 5 random chars
        setSlug(`${baseSlug}-${uid5}`);
      } else {
        setSlug('');
      }
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Tên danh mục không được để trống';
    if (isEdit && !slug.trim()) errs.slug = 'Slug danh mục không được để trống';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      if (isEdit && editingCategory) {
        const updateData: UpdateCategoryRequest = {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          image: parentId === null ? image : undefined, // Only pass image for root category
          parentId: parentId || null,
        };
        await categoryController.updateCategoryAdmin(editingCategory.id, updateData);
      } else {
        const createData: CreateCategoryRequest = {
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          image: parentId === null ? image : undefined, // Only pass image for root category
          parentId: parentId || null,
        };
        await categoryController.createCategoryAdmin(createData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Lỗi khi lưu danh mục:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isEdit,
    name,
    setName: handleNameChange,
    slug,
    setSlug,
    description,
    setDescription,
    image,
    setImage,
    parentId,
    setParentId: handleParentIdChange,
    submitting,
    errors,
    handleSubmit,
  };
}
