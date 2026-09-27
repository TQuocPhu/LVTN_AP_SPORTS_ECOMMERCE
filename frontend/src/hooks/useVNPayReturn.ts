import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { orderController } from '@/controllers/order-controller';
import { OrderResponse } from '@/types/order';

export interface UseVNPayReturnResult {
  loading: boolean;
  order: OrderResponse | null;
  errorMsg: string | null;
  retryingPayment: boolean;
  responseCode: string | null;
  txnRef: string | null;
  transactionNo: string | null;
  amountStr: string | null;
  handleRetryPayment: () => Promise<string | null>; // Returns paymentUrl or null
}

export function useVNPayReturn(): UseVNPayReturnResult {
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();

  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryingPayment, setRetryingPayment] = useState<boolean>(false);

  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef');
  const transactionNo = searchParams.get('vnp_TransactionNo');
  const amountStr = searchParams.get('vnp_Amount');

  useEffect(() => {
    async function verifyPayment() {
      if (!txnRef) {
        setLoading(false);
        setErrorMsg('Mã đơn hàng vnp_TxnRef không hợp lệ.');
        return;
      }

      const paramsObj: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        paramsObj[key] = val;
      });

      try {
        const res = await orderController.processVNPayReturn(paramsObj);
        if (res.data) {
          setOrder(res.data);
          if (paramsObj.vnp_ResponseCode === '00') {
            await refreshCart();
          }
        } else {
          setErrorMsg(res.message || 'Không thể xử lý kết quả thanh toán VNPay.');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xử lý thanh toán thất bại.';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [searchParams, txnRef]);

  const handleRetryPayment = useCallback(async (): Promise<string | null> => {
    if (!order?.orderCode) return null;
    setRetryingPayment(true);
    try {
      const res = await orderController.retryVNPayPayment(order.orderCode);
      if (res.data?.paymentUrl) {
        return res.data.paymentUrl;
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể khởi tạo lại liên kết thanh toán.';
      setErrorMsg(msg);
      return null;
    } finally {
      setRetryingPayment(false);
    }
  }, [order?.orderCode]);

  return {
    loading,
    order,
    errorMsg,
    retryingPayment,
    responseCode,
    txnRef,
    transactionNo,
    amountStr,
    handleRetryPayment,
  };
}
