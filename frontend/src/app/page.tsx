"use client";

import { useState } from "react";
import UserManagement from "@/components/UserManagement";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [acidLoading, setAcidLoading] = useState(false);
  const [acidMsg, setAcidMsg] = useState<string | null>(null);

  const testBackendConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/health");
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setBackendStatus(data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to Spring Boot backend (http://localhost:8080)");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setAcidLoading(true);
    setAcidMsg(null);
    try {
      const res = await fetch("http://localhost:8080/api/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể tải danh sách tài khoản");
      setAccounts(data.data || []);
    } catch (err: any) {
      setAcidMsg(`❌ Lỗi: ${err.message}`);
    } finally {
      setAcidLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Gradient Effect */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 -z-10 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md bg-slate-950/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              L
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              LVTN Workspace
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Next.js Ready
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Spring Boot 3.3.5 (Java 21)
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Hero Banner */}
        <div className="relative rounded-2xl border border-slate-800 p-8 sm:p-12 overflow-hidden bg-gradient-to-b from-slate-900/80 to-slate-900/30">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-2xl flex flex-col gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Standard Architecture & Data Flow Configured 🚀
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Luồng dữ liệu: <code className="text-indigo-300">Page ➔ Component ➔ Hook ➔ FE Controller ➔ BE Controller ➔ BE Service ➔ BE Repository ➔ DB</code>
            </p>
          </div>
        </div>

        {/* Section 1: User Management Component (Demonstrating Full Data Flow & DTO Protection) */}
        <UserManagement />

        {/* Section 2: Backend REST & Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Backend Connection Test */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between backdrop-blur font-sans">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">⚡</span> Spring Boot REST Health
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  http://localhost:8080
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Test kết nối trực tiếp tới Spring Boot REST Controller (`/api/health`).
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                id="btn-test-backend"
                onClick={testBackendConnection}
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950 font-medium text-sm text-white transition duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? "Connecting..." : "Test Connection to Backend"}
              </button>

              {error && <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">❌ {error}</div>}

              {backendStatus && (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex flex-col gap-1">
                  <div className="font-semibold text-emerald-400">✅ Connected Successfully!</div>
                  <pre className="mt-1 text-[11px] text-slate-300 overflow-x-auto p-2 rounded bg-slate-950/80">
                    {JSON.stringify(backendStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Database ACID Transaction Tester */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between backdrop-blur">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="text-xl">🗄️</span> Database ACID Test
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  @Transactional
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Giao dịch Chuyển tiền chuẩn ACID (Optimistic Locking `@Version`).
              </p>

              <button
                id="btn-fetch-accounts"
                onClick={fetchAccounts}
                disabled={acidLoading}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition mb-4"
              >
                {acidLoading ? "Loading..." : "Xem Danh Sách Tài Khoản"}
              </button>

              {acidMsg && <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 mb-4">{acidMsg}</div>}

              {accounts.length > 0 && (
                <div className="space-y-2 text-xs font-mono">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="p-2 rounded bg-slate-950/70 border border-slate-800 flex justify-between">
                      <span>{acc.accountNumber} ({acc.ownerName}):</span>
                      <span className="text-emerald-400 font-bold">{Number(acc.balance).toLocaleString("vi-VN")} VNĐ</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
