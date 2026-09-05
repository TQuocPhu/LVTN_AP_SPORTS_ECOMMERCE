"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

export default function UserManagement() {
  const { users, loading, error, loadUsers, createUser } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await createUser({ username, email, password, fullName });
      setMsg("✅ Tạo người dùng thành công (Mật khẩu được mã hóa an toàn ở Backend)!");
      setUsername("");
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (err: any) {
      setMsg(`❌ Lỗi: ${err.message}`);
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <span className="text-xl">👥</span> Quản Lý Người Dùng (Full Data-Flow Demo)
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Luồng đi: <code className="text-indigo-300">Page ➔ Component ➔ Hook ➔ FE Controller ➔ BE Controller ➔ BE Service ➔ BE Repository ➔ DB</code>
      </p>

      {/* Form tạo user */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <input
          type="text"
          placeholder="Họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="px-3 py-2 rounded bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-xs font-semibold text-white transition"
        >
          {loading ? "Đang xử lý..." : "+ Tạo Người Dùng Mới"}
        </button>
      </form>

      {msg && <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono mb-4">{msg}</div>}

      {/* Danh sách users (Cấm trả password) */}
      <div>
        <h3 className="text-xs font-semibold text-slate-300 mb-2">Danh sách User (Đã lọc bỏ Password từ Backend):</h3>
        {users.length === 0 ? (
          <div className="text-xs text-slate-500 italic">Chưa có người dùng nào.</div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="p-3 rounded bg-slate-950/80 border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">{u.fullName}</span> <span className="text-slate-400">(@{u.username})</span>
                  <div className="text-slate-500 text-[11px]">{u.email}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-mono">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
