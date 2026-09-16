import { redirect } from 'next/navigation';

/**
 * /admin → tự động chuyển hướng đến /admin/dashboard
 * Dùng async để redirect() hoạt động đúng trong Next.js App Router
 */
export default async function AdminPage() {
  redirect('/admin/dashboard');
}
