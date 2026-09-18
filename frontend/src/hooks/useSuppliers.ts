'use client';

import { useState, useEffect, useCallback } from 'react';
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

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supplierController.getSuppliers(keyword.trim() || undefined, page, pageSize);
      if (res.data) {
        setSuppliers(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // Toast error handled
    } finally {
      setLoading(false);
    }
  }, [keyword, page, pageSize]);

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
