'use client';

import { useState, useEffect, useCallback } from 'react';
import { addressController } from '@/controllers/address-controller';
import { ShippingAddress, ShippingAddressRequest } from '@/types/address';
import { isApiError } from '@/services/api-client';

export function useAddresses() {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await addressController.getAddresses();
      if (res && res.data) {
        setAddresses(res.data);
      }
    } catch (err) {
      if (!(isApiError(err) && err.status === 401)) {
        console.error('Lỗi lấy danh sách địa chỉ:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const createAddress = async (data: ShippingAddressRequest) => {
    try {
      setLoading(true);
      const res = await addressController.createAddress(data);
      await fetchAddresses();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: number, data: ShippingAddressRequest) => {
    try {
      setLoading(true);
      const res = await addressController.updateAddress(id, data);
      await fetchAddresses();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: number) => {
    try {
      setLoading(true);
      const res = await addressController.deleteAddress(id);
      await fetchAddresses();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      setLoading(true);
      const res = await addressController.setDefaultAddress(id);
      await fetchAddresses();
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    addresses,
    loading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetchAddresses: fetchAddresses,
  };
}
