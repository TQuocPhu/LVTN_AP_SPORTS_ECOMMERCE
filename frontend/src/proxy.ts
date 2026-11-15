import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify, importSPKI } from 'jose';

type KeyType = Awaited<ReturnType<typeof importSPKI>>;

// Cache SPKI Key Promise trên Edge Worker Instance
let publicKeyPromise: Promise<KeyType> | null = null;

async function getPublicKey(): Promise<KeyType | null> {
  const rawKey = process.env.JWT_PUBLIC_KEY;
  if (!rawKey) {
    console.error('Edge Middleware Error: Thiếu biến môi trường JWT_PUBLIC_KEY');
    return null;
  }

  if (!publicKeyPromise) {
    try {
      const formattedKey = rawKey.replace(/\\n/g, '\n');
      publicKeyPromise = importSPKI(formattedKey, 'RS256');
    } catch (err) {
      console.error('Edge Middleware Error: Không thể parse RSA Public Key từ JWT_PUBLIC_KEY', err);
      return null;
    }
  }

  return publicKeyPromise;
}

interface JwtPayloadCustom {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
}

/**
 * Next.js 16 Proxy (trước đây gọi là middleware) xác thực JWT RS256 tại tầng Edge.
 * Đảm bảo 100% không có hiện tượng Flash UI khi truy cập các trang protected.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const hasRefreshToken = !!request.cookies.get('refreshToken')?.value;
  const hasClientSessionFlag = request.cookies.get('apsports_has_session')?.value === 'true';

  let isValidToken = false;
  let userRole: string | undefined = undefined;

  if (token) {
    try {
      const publicKey = await getPublicKey();
      if (publicKey) {
        const { payload } = await jwtVerify(token, publicKey, {
          clockTolerance: 30, // Cho phép chênh lệch thời gian 30s giữa các server
        });
        const customPayload = payload as JwtPayloadCustom;
        isValidToken = true;
        userRole = customPayload.role;
      }
    } catch {
      // Token hết hạn, chữ ký không hợp lệ, hoặc lỗi verify
      isValidToken = false;
    }
  }

  // Session được coi là Active nếu AccessToken hợp lệ HOẶC có RefreshToken Cookie để FE thực hiện Silent Refresh
  const isSessionActive = isValidToken || hasRefreshToken;

  // Danh sách các nhóm Route
  const isCustomerRoute = ['/profile', '/account', '/orders', '/checkout'].some((path) =>
    pathname.startsWith(path)
  );
  const isAdminRoute = pathname.startsWith('/admin');
  const isWarehouseRoute = pathname.startsWith('/warehouse');
  const isSaleRoute = pathname.startsWith('/staff');
  const isDemoRoute = pathname.startsWith('/demo');
  const isGuestOnlyRoute = ['/login', '/register'].some((path) => pathname.startsWith(path));

  // 1. Trang bắt buộc đăng nhập (Customer Routes)
  if (isCustomerRoute) {
    if (!isSessionActive) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('reason', 'login_required');
      return NextResponse.redirect(loginUrl, 307);
    }
  }

  // 2. Trang Quản trị Admin
  if (pathname === '/admin/login') {
    const hasAdminSessionFlag = request.cookies.get('apsports_admin_has_session')?.value === 'true';
    const hasReason = request.nextUrl.searchParams.has('reason');

    // Chuyển hướng về trang làm việc nếu cờ client session đang bật, không có query báo lỗi/hết phiên,
    // và token còn hợp lệ (role khác CUSTOMER) HOẶC vẫn còn refreshToken để FE tự Silent Refresh
    if (hasAdminSessionFlag && !hasReason) {
      if (isValidToken) {
        const normalizedRole = userRole?.replace(/^ROLE_/, '');
        if (normalizedRole && normalizedRole !== 'CUSTOMER') {
          const targetPath =
            normalizedRole === 'STAFF'
              ? '/admin/orders'
              : normalizedRole === 'WAREHOUSE_MANAGER'
                ? '/admin/inventory'
                : '/admin/dashboard';
          return NextResponse.redirect(new URL(targetPath, request.url), 307);
        }
      } else if (hasRefreshToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url), 307);
      }
    }

    // Nếu người dùng truy cập /admin/login nhưng cờ session tắt hoặc phiên hết hạn:
    // Dọn sạch toàn bộ Cookie HttpOnly cũ còn sót lại để triệt tiêu hoàn toàn Infinite Redirect Loop
    if (token || hasRefreshToken) {
      const res = NextResponse.next();
      res.cookies.set('accessToken', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
      res.cookies.set('refreshToken', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
      res.cookies.set('apsports_admin_has_session', '', { path: '/', maxAge: 0 });
      return res;
    }

    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isSessionActive) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(adminLoginUrl, 307);
    }
    if (isValidToken) {
      const normalizedRole = userRole?.replace(/^ROLE_/, '');
      if (normalizedRole === 'CUSTOMER') {
        return NextResponse.redirect(new URL('/admin/login', request.url), 307);
      }

      // Phân quyền chặt chẽ các sub-routes trong /admin:
      if (normalizedRole === 'STAFF') {
        // STAFF KHÔNG có quyền truy cập: Kho vận (/admin/inventory, /admin/inventory/requests, /admin/suppliers), Mã giảm giá (/admin/vouchers), Quản lý người dùng (/admin/users), Danh mục (/admin/categories)
        if (
          pathname.startsWith('/admin/inventory') ||
          pathname.startsWith('/admin/suppliers') ||
          pathname.startsWith('/admin/vouchers') ||
          pathname.startsWith('/admin/users') ||
          pathname.startsWith('/admin/categories')
        ) {
          return NextResponse.redirect(new URL('/admin/orders', request.url), 307);
        }
      }

      if (normalizedRole === 'WAREHOUSE_MANAGER') {
        // Quản lý kho chỉ phụ trách Kho vận, Báo cáo và Sản phẩm; không truy cập: Đơn hàng, Voucher, Người dùng, Danh mục, CSKH
        if (
          pathname.startsWith('/admin/orders') ||
          pathname.startsWith('/admin/vouchers') ||
          pathname.startsWith('/admin/users') ||
          pathname.startsWith('/admin/categories') ||
          pathname.startsWith('/admin/support-chat')
        ) {
          return NextResponse.redirect(new URL('/admin/inventory', request.url), 307);
        }
      }
    }
  }

  // 3. Trang Quản lý Kho
  if (isWarehouseRoute) {
    if (!isSessionActive) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('reason', 'login_required');
      return NextResponse.redirect(loginUrl, 307);
    }
    if (isValidToken) {
      const normalizedRole = userRole?.replace(/^ROLE_/, '');
      if (normalizedRole !== 'ADMIN' && normalizedRole !== 'WAREHOUSE_MANAGER') {
        const forbiddenUrl = new URL('/403', request.url);
        forbiddenUrl.searchParams.set('reason', 'unauthorized');
        return NextResponse.redirect(forbiddenUrl, 307);
      }
    }
  }

  // 4. Trang Bán hàng / CSKH
  if (isSaleRoute) {
    if (!isSessionActive) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('reason', 'login_required');
      return NextResponse.redirect(loginUrl, 307);
    }
    if (isValidToken) {
      const normalizedRole = userRole?.replace(/^ROLE_/, '');
      if (normalizedRole !== 'ADMIN' && normalizedRole !== 'STAFF') {
        const forbiddenUrl = new URL('/403', request.url);
        forbiddenUrl.searchParams.set('reason', 'unauthorized');
        return NextResponse.redirect(forbiddenUrl, 307);
      }
    }
  }

  // 5. Trang dành riêng cho khách chưa đăng nhập (/login, /register)
  if (isGuestOnlyRoute) {
    const hasReason = request.nextUrl.searchParams.has('reason');

    // Chuyển hướng về '/' khi cờ phiên Client ('apsports_has_session') đang bật, không có query báo lỗi/hết phiên,
    // và AccessToken còn hợp lệ HOẶC vẫn còn RefreshToken để FE tự Silent Refresh.
    // Nếu người dùng đã bấm Đăng xuất ở Client (mất cờ 'apsports_has_session') hoặc phiên hết hạn hoàn toàn,
    // lập tức dọn sạch Cookie cũ để cho phép mở trang /login và /register bình thường.
    if (hasClientSessionFlag && !hasReason && (isValidToken || hasRefreshToken)) {
      return NextResponse.redirect(new URL('/', request.url), 307);
    }
    if (token || hasRefreshToken) {
      const res = NextResponse.next();
      res.cookies.set('accessToken', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
      res.cookies.set('refreshToken', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
      return res;
    }
  }

  // 6. Cổng Mô phỏng Logistics (/demo/*)
  if (pathname === '/demo/login') {
    const hasLogisticsSessionFlag = request.cookies.get('apsports_logistics_has_session')?.value === 'true';
    const hasReason = request.nextUrl.searchParams.has('reason');

    if (hasLogisticsSessionFlag && !hasReason) {
      if (isValidToken) {
        const normalizedRole = userRole?.replace(/^ROLE_/, '');
        if (normalizedRole === 'GHN_STATION') {
          return NextResponse.redirect(new URL('/demo/ghn-station', request.url), 307);
        }
        if (normalizedRole === 'GHN_SHIPPER') {
          return NextResponse.redirect(new URL('/demo/shipper-app', request.url), 307);
        }
      } else if (hasRefreshToken) {
        return NextResponse.redirect(new URL('/demo', request.url), 307);
      }
    }

    if (token || hasRefreshToken) {
      const res = NextResponse.next();
      res.cookies.set('accessToken', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
      res.cookies.set('refreshToken', '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
      res.cookies.set('apsports_logistics_has_session', '', { path: '/', maxAge: 0 });
      return res;
    }

    return NextResponse.next();
  }

  if (isDemoRoute) {
    if (!isSessionActive) {
      const demoLoginUrl = new URL('/demo/login', request.url);
      demoLoginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(demoLoginUrl, 307);
    }
    if (isValidToken) {
      const normalizedRole = userRole?.replace(/^ROLE_/, '');
      if (normalizedRole !== 'GHN_STATION' && normalizedRole !== 'GHN_SHIPPER') {
        return NextResponse.redirect(new URL('/demo/login', request.url), 307);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/account/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/warehouse/:path*',
    '/sale/:path*',
    '/demo/:path*',
    '/login',
    '/register',
  ],
};
