'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminProductController } from '@/controllers/admin-product-controller';
import { ProductVariant, CreateProductFormRequest, UpdateProductFormRequest } from '@/types/product';
import { isApiError } from '@/services/api-client';

export interface SpecPair {
  key: string;
  value: string;
}

export interface VariantAttributeGroup {
  id: string;
  name: string;
  values: string[];
}

export function useProductForm(productId?: number) {
  const isEdit = !!productId;
  const [activeStep, setActiveStep] = useState<number>(0);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState<string>('Cái');
  const [mainImage, setMainImage] = useState<string>('');
  const [status, setStatus] = useState<string>('in_stock');
  const [description, setDescription] = useState<string>('');
  const [specifications, setSpecifications] = useState<SpecPair[]>([
    { key: 'Chất liệu', value: '' },
    { key: 'Xuất xứ', value: '' },
    { key: 'Thương hiệu', value: '' },
  ]);

  // Dynamic Variant Attribute Groups (Color, Size, Weight, Tension, etc.)
  const [attributeGroups, setAttributeGroups] = useState<VariantAttributeGroup[]>([
    { id: 'color', name: 'Màu sắc', values: [] },
    { id: 'size', name: 'Kích thước / Size', values: [] },
  ]);

  const [variantColors, setVariantColors] = useState<string[]>([]);
  const [variantSizes, setVariantSizes] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // UI State & Validation Errors
  const [loading, setLoading] = useState<boolean>(isEdit);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name with UID and timestamp
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
        const timestamp = Date.now().toString().slice(-6);
        const uid = Math.random().toString(36).substring(2, 6);
        setSlug(`${baseSlug}-${uid}${timestamp}`);
      } else {
        setSlug('');
      }
    }
  };

  // Fetch product detail for edit mode
  const fetchProductDetail = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await adminProductController.getProductById(productId);
      if (res && res.data) {
        const prod = res.data;
        setName(prod.name || '');
        setSlug(prod.slug || '');
        setCategoryIds(prod.categories?.map((c) => c.id) || []);
        setPrimaryCategoryId(prod.primaryCategoryId);
        setPrice(prod.price || 0);
        setUnit(prod.unit || 'Cái');
        setMainImage(prod.mainImage || '');
        setStatus(prod.status || 'in_stock');
        setDescription(prod.description || '');

        if (prod.specifications) {
          const specArray = Object.entries(prod.specifications).map(([key, value]) => ({
            key,
            value,
          }));
          setSpecifications(specArray.length > 0 ? specArray : [{ key: 'Chất liệu', value: '' }]);
        }

        if (prod.variants) {
          setVariants(prod.variants);
          const colors = Array.from(new Set(prod.variants.map((v) => v.color).filter(Boolean))) as string[];
          const sizes = Array.from(new Set(prod.variants.map((v) => v.size).filter(Boolean))) as string[];
          setVariantColors(colors);
          setVariantSizes(sizes);

          setAttributeGroups([
            { id: 'color', name: 'Màu sắc', values: colors },
            { id: 'size', name: 'Kích thước / Size', values: sizes },
          ]);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin sản phẩm chỉnh sửa:', err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  // Attribute Group Handlers
  const addAttributeGroup = (groupName: string) => {
    if (!groupName.trim()) return;
    const newId = `attr_${Date.now()}`;
    setAttributeGroups((prev) => [...prev, { id: newId, name: groupName.trim(), values: [] }]);
  };

  const removeAttributeGroup = (groupId: string) => {
    setAttributeGroups((prev) => {
      const next = prev.filter((g) => g.id !== groupId);
      generateVariantsFromGroups(next);
      return next;
    });
  };

  const addAttributeValue = (groupId: string, val: string) => {
    if (!val.trim()) return;
    setAttributeGroups((prev) => {
      const next = prev.map((g) => {
        if (g.id === groupId && !g.values.includes(val.trim())) {
          return { ...g, values: [...g.values, val.trim()] };
        }
        return g;
      });
      generateVariantsFromGroups(next);
      return next;
    });
  };

  const removeAttributeValue = (groupId: string, val: string) => {
    setAttributeGroups((prev) => {
      const next = prev.map((g) => {
        if (g.id === groupId) {
          return { ...g, values: g.values.filter((v) => v !== val) };
        }
        return g;
      });
      generateVariantsFromGroups(next);
      return next;
    });
  };

  // Cartesian Product Generator for N Dynamic Attribute Groups
  const generateVariantsFromGroups = (groups: VariantAttributeGroup[]) => {
    const activeGroups = groups.filter((g) => g.values.length > 0);
    if (activeGroups.length === 0) return;

    const basePrice = typeof price === 'number' ? price : 0;
    const rawPrefix = (slug || 'PROD').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const baseSkuPrefix = rawPrefix.length > 35 ? rawPrefix.substring(0, 35) : rawPrefix;

    const cartesian = (args: string[][]): string[][] => {
      const r: string[][] = [];
      const max = args.length - 1;
      function helper(arr: string[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
          const a = [...arr, args[i][j]];
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const valueMatrix = activeGroups.map((g) => g.values);
    const combinations = cartesian(valueMatrix);

    const newVariants: ProductVariant[] = combinations.map((comb) => {
      const pairMap: Record<string, string> = {};
      activeGroups.forEach((group, idx) => {
        pairMap[group.name] = comb[idx];
      });

      const colorGroup = activeGroups.find((g) =>
        g.name.toLowerCase().includes('màu')
      );
      const colorVal = colorGroup ? pairMap[colorGroup.name] : undefined;

      const nonColorPairs = activeGroups
        .filter((g) => g !== colorGroup)
        .map((g) => pairMap[g.name]);

      const sizeVal = nonColorPairs.length > 0 ? nonColorPairs.join(' | ') : 'Freesize';

      const skuParts = [baseSkuPrefix, ...comb.map((c) => c.toUpperCase().replace(/\s+/g, ''))];
      const sku = skuParts.join('-');

      const existing = variants.find((v) => v.sku === sku);
      if (existing) return existing;

      return {
        sku,
        size: sizeVal,
        color: colorVal,
        price: basePrice,
        costPrice: Math.round(basePrice * 0.7),
        stockQuantity: isEdit ? 0 : 10,
        images: [],
      };
    });

    setVariants(newVariants);
  };

  // Legacy generateVariants wrapper
  const generateVariants = (colors: string[], sizes: string[]) => {
    setAttributeGroups([
      { id: 'color', name: 'Màu sắc', values: colors },
      { id: 'size', name: 'Kích thước / Size', values: sizes },
    ]);
    generateVariantsFromGroups([
      { id: 'color', name: 'Màu sắc', values: colors },
      { id: 'size', name: 'Kích thước / Size', values: sizes },
    ]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariantRow = () => {
    const basePrice = typeof price === 'number' ? price : 0;
    const baseSkuPrefix = (slug || 'PROD').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const uniqueId = Date.now().toString().slice(-4);
    setVariants((prev) => [
      ...prev,
      {
        sku: `${baseSkuPrefix}-VAR-${uniqueId}`,
        size: 'Freesize',
        price: basePrice,
        costPrice: Math.round(basePrice * 0.7),
        stockQuantity: isEdit ? 0 : 0,
        images: [],
      },
    ]);
  };

  // Step Validations
  const validateStep0 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Tên sản phẩm không được để trống';
    if (isEdit && !slug.trim()) errs.slug = 'Slug sản phẩm không được để trống';
    if (categoryIds.length === 0) errs.categoryIds = 'Vui lòng chọn ít nhất 1 danh mục';
    if (price === '' || price < 0) errs.price = 'Giá sản phẩm phải lớn hơn hoặc bằng 0';
    if (!unit.trim()) errs.unit = 'Đơn vị tính không được để trống';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = (): boolean => {
    setErrors({});
    return true;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (variants.length === 0) {
      errs.variants = 'Sản phẩm phải có ít nhất 1 biến thể';
    } else {
      variants.forEach((v, idx) => {
        if (!v.sku.trim()) errs[`variant_sku_${idx}`] = 'Mã SKU không được trống';
        if (!v.size.trim()) errs[`variant_size_${idx}`] = 'Size / Thuộc tính không được trống';
        if (v.price < 0) errs[`variant_price_${idx}`] = 'Giá bán phải >= 0';
        if (v.costPrice < 0) errs[`variant_cost_${idx}`] = 'Giá nhập phải >= 0';
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (activeStep === 0 && !validateStep0()) return;
    if (activeStep === 1 && !validateStep1()) return;
    if (activeStep === 2 && !validateStep2()) return;
    setActiveStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Submit Handler
  const submitForm = async () => {
    if (!validateStep0() || !validateStep2()) {
      setActiveStep(0);
      return;
    }

    const specsMap: Record<string, string> = {};
    specifications.forEach((sp) => {
      if (sp.key.trim() && sp.value.trim()) {
        specsMap[sp.key.trim()] = sp.value.trim();
      }
    });

    try {
      setSubmitting(true);
      setErrors({});

      if (isEdit && productId) {
        const updateData: UpdateProductFormRequest = {
          name: name.trim(),
          slug: slug.trim(),
          categoryIds,
          primaryCategoryId: primaryCategoryId || categoryIds[0],
          description,
          price: typeof price === 'number' ? price : 0,
          unit,
          status,
          mainImage,
          specifications: specsMap,
          variants,
        };
        const res = await adminProductController.updateProduct(productId, updateData);
        return res;
      } else {
        const createData: CreateProductFormRequest = {
          name: name.trim(),
          slug: slug.trim() || undefined,
          categoryIds,
          primaryCategoryId: primaryCategoryId || categoryIds[0],
          description,
          price: typeof price === 'number' ? price : 0,
          unit,
          mainImage,
          specifications: specsMap,
          variants,
        };
        const res = await adminProductController.createProduct(createData);
        return res;
      }
    } catch (err: any) {
      if (isApiError(err) && err.fieldErrors) {
        setErrors(err.fieldErrors);
      }
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isEdit,
    activeStep,
    setActiveStep,
    nextStep,
    prevStep,

    // Form fields
    name,
    setName: handleNameChange,
    slug,
    setSlug,
    categoryIds,
    setCategoryIds,
    primaryCategoryId,
    setPrimaryCategoryId,
    price,
    setPrice,
    unit,
    setUnit,
    mainImage,
    setMainImage,
    status,
    setStatus,
    description,
    setDescription,
    specifications,
    setSpecifications,

    // Dynamic Attribute Groups
    attributeGroups,
    setAttributeGroups,
    addAttributeGroup,
    removeAttributeGroup,
    addAttributeValue,
    removeAttributeValue,

    // Variants
    variantColors,
    setVariantColors,
    variantSizes,
    setVariantSizes,
    variants,
    setVariants,
    generateVariants,
    updateVariant,
    removeVariant,
    addVariantRow,

    // Status & Error
    loading,
    submitting,
    errors,
    submitForm,
  };
}
