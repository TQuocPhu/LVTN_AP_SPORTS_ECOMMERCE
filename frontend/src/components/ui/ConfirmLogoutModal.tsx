'use client';

import { useState } from 'react';
import { LogOut, AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * Modern Glassmorphic Logout Confirmation Modal Component.
 * Thay thế 100% window.confirm() mặc định bằng Modal hiện đại chuẩn AP Sports.
 */
export default function ConfirmLogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmLogoutModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } catch (err) {
      console.error('Lỗi khi đăng xuất:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Container Box */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center transform transition-all animate-scale-up">
        {/* Glow Accent Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6 shadow-lg shadow-red-500/10">
          <LogOut className="w-8 h-8 translate-x-0.5" />
        </div>

        {/* Content Title & Description */}
        <h3 className="text-xl font-extrabold text-white tracking-wide uppercase mb-2">
          XÁC NHẬN ĐĂNG XUẤT
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không? Phiên làm việc hiện tại của bạn sẽ kết thúc.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-bold transition-all disabled:opacity-50"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-sm font-bold shadow-lg shadow-red-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang thoát...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Đăng Xuất</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
