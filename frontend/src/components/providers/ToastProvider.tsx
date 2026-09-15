'use client';

import { Toaster, toast } from 'sonner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

function ToastReasonListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Track the last reason we already showed to prevent StrictMode double-fire
  const shownReasonRef = useRef<string | null>(null);

  useEffect(() => {
    const reason = searchParams?.get('reason');
    if (!reason) return;
    // Already showed a toast for this reason — skip
    if (shownReasonRef.current === reason) return;
    shownReasonRef.current = reason;

    if (reason === 'unauthorized') {
      toast.error('Từ chối truy cập!', {
        description: 'Bạn không có quyền truy cập vào trang quản trị này.',
      });
    } else if (reason === 'login_required') {
      toast.warning('Yêu cầu đăng nhập!', {
        description: 'Vui lòng đăng nhập để truy cập trang thông tin cá nhân.',
      });
    } else if (reason === 'session_expired') {
      toast.error('Phiên làm việc hết hạn!', {
        description: 'Vui lòng đăng nhập lại để tiếp tục sử dụng.',
      });
    }

    // Clear query param safely using Next.js router after hydration initialization completes
    const timer = setTimeout(() => {
      try {
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.delete('reason');
        const newSearch = currentParams.toString();
        const targetUrl = newSearch ? `${pathname}?${newSearch}` : pathname;
        router.replace(targetUrl, { scroll: false });
      } catch (err) {
        console.warn('ToastReasonListener router replace ignored:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchParams, router, pathname]);

  return null;
}

export default function ToastProvider() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={2000}
        toastOptions={{
          style: {
            borderRadius: '0.75rem',
            padding: '1rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          },
        }}
      />
      <Suspense fallback={null}>
        <ToastReasonListener />
      </Suspense>
    </>
  );
}

export { toast };
