import { useState, useEffect, useCallback, useRef } from 'react';
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
  const verifiedPromiseRef = useRef<{
    key: string;
    promise: Promise<Awaited<ReturnType<typeof orderController.processVNPayReturn>>>;
  } | null>(null);

  const responseCode = searchParams.get('vnp_ResponseCode');
  const txnRef = searchParams.get('vnp_TxnRef');
  const transactionNo = searchParams.get('vnp_TransactionNo');
  const amountStr = searchParams.get('vnp_Amount');

  useEffect(() => {
    let isMounted = true;

    async function verifyPayment() {
      if (!txnRef) {
        if (isMounted) {
          setLoading(false);
          setErrorMsg('Mã đơn hàng vnp_TxnRef không hợp lệ.');
        }
        return;
      }

      const currentKey = searchParams.toString();
      const paramsObj: Record<string, string> = {};
      searchParams.forEach((val, key) => {
        paramsObj[key] = val;
      });

      try {
        // Tái sử dụng promise đang chạy cùng query key để React Strict Mode không gọi trùng API nhưng vẫn tắt loading đúng
        if (!verifiedPromiseRef.current || verifiedPromiseRef.current.key !== currentKey) {
          verifiedPromiseRef.current = {
            key: currentKey,
            promise: orderController.processVNPayReturn(paramsObj),
          };
        }

        const res = await verifiedPromiseRef.current.promise;
        if (!isMounted) return;

        if (res.data) {
          setOrder(res.data);
          // Làm mới giỏ hàng ở nền, không chặn tắt loading màn hình kết quả
          refreshCart().catch(() => {});
        } else {
          setErrorMsg(res.message || 'Không thể xử lý kết quả thanh toán VNPay.');
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Xử lý thanh toán thất bại.';
        setErrorMsg(msg);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifyPayment();
    return () => {
      isMounted = false;
    };
  }, [searchParams, txnRef, refreshCart]);

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
