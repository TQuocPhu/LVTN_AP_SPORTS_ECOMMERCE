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
  const isSaleRoute = pathname.startsWith('/sale');
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
    if (isValidToken) {
      const normalizedRole = userRole?.replace(/^ROLE_/, '');
      if (normalizedRole && normalizedRole !== 'CUSTOMER') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url), 307);
      }
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
      if (normalizedRole !== 'ADMIN' && normalizedRole !== 'WAREHOUSE') {
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
      if (normalizedRole !== 'ADMIN' && normalizedRole !== 'SALE') {
        const forbiddenUrl = new URL('/403', request.url);
        forbiddenUrl.searchParams.set('reason', 'unauthorized');
        return NextResponse.redirect(forbiddenUrl, 307);
      }
    }
  }

  // 5. Trang dành riêng cho khách chưa đăng nhập (/login, /register)
  if (isGuestOnlyRoute && isValidToken) {
    return NextResponse.redirect(new URL('/', request.url), 307);
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
    '/login',
    '/register',
  ],
};
