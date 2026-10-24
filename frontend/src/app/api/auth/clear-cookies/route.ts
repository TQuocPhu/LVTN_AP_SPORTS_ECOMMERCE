import { NextResponse } from 'next/server';

/**
 * Next.js Route Handler hỗ trợ xóa triệt để các HttpOnly Cookies (`accessToken`, `refreshToken`)
 * ngay trên trình duyệt của người dùng khi đăng xuất (kể cả khi Backend chưa phản hồi hoặc lỗi mạng).
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Đã xóa sạch phiên Cookie trên trình duyệt.',
  });

  response.cookies.set('accessToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('apsports_has_session', '', {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
