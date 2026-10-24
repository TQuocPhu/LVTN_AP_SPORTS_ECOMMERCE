'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Supplier, SupplierRequest } from '@/types/inventory';
import { supplierController } from '@/controllers/supplier-controller';
import { toast } from 'sonner';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>('');

  // Debounce 400ms cho từ khóa tìm kiếm nhà cung cấp
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Quản lý AbortController để hủy request cũ khi thay đổi từ khóa / phân trang
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuppliers = useCallback(async () => {
    // 1. Hủy request đang bay trước đó để chống Race Condition
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const res = await supplierController.getSuppliers(
        debouncedKeyword.trim() || undefined,
        page,
        pageSize,
        'createdAt',
        'DESC',
        { signal: controller.signal }
      );
      if (res.data) {
        setSuppliers(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: unknown) {
      if (
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError'))
      ) {
        return; // Bỏ qua lỗi hủy request
      }
      // Toast error handled
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, page, pageSize]);

  const fetchSuppliersList = useCallback(async () => {
    try {
      const res = await supplierController.getSuppliersList();
      if (res.data) {
        setSuppliersList(res.data);
      }
    } catch {
      // Toast error handled
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchSuppliers]);

  const handleCreateSupplier = async (data: SupplierRequest): Promise<boolean> => {
    try {
      const res = await supplierController.createSupplier(data);
      if (res.data) {
        await fetchSuppliers();
        await fetchSuppliersList();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUpdateSupplier = async (id: number, data: SupplierRequest): Promise<boolean> => {
    try {
      const res = await supplierController.updateSupplier(id, data);
      if (res.data) {
        await fetchSuppliers();
        await fetchSuppliersList();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDeleteSupplier = async (id: number): Promise<boolean> => {
    try {
      await supplierController.deleteSupplier(id);
      await fetchSuppliers();
      await fetchSuppliersList();
      return true;
    } catch {
      return false;
    }
  };

  return {
    suppliers,
    suppliersList,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    keyword,
    setKeyword,
    fetchSuppliers,
    fetchSuppliersList,
    createSupplier: handleCreateSupplier,
    updateSupplier: handleUpdateSupplier,
    deleteSupplier: handleDeleteSupplier,
  };
}
