'use client';

/**
 * useAuth – Hook tương thích ngược, ủy quyền toàn bộ về AuthContext.
 *
 * Mọi component (Navbar, LoginForm, AccountPageShell, v.v.) đã import
 * useAuth từ đây KHÔNG CẦN SỬA – chúng tự động đọc từ AuthContext chung.
 *
 * @see AuthContext.tsx – nơi chứa state thực tế và logic fetch/login/logout
 */
export { useAuthContext as useAuth } from '@/context/AuthContext';
