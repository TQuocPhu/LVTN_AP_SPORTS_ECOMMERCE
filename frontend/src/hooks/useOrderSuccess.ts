import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { orderController } from '@/controllers/order-controller';
import { OrderResponse } from '@/types/order';

export interface UseOrderSuccessResult {
  loading: boolean;
  order: OrderResponse | null;
  errorMsg: string | null;
  orderCode: string | null;
}

export function useOrderSuccess(): UseOrderSuccessResult {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('code');
  const { refreshCart } = useCart();

  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderCode) {
        setLoading(false);
        setErrorMsg('Mã đơn hàng không hợp lệ.');
        return;
      }
      try {
        const res = await orderController.getOrderByCode(orderCode);
        if (res.data) {
          setOrder(res.data);
          await refreshCart();
        } else {
          setErrorMsg('Không tìm thấy thông tin đơn hàng.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải đơn hàng.';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderCode]);

  return {
    loading,
    order,
    errorMsg,
    orderCode,
  };
}
