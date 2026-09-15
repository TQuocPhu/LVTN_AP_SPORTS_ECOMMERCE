'use client';

import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Component Slide-Over Mini Cart Drawer.
 * Trượt mượt từ bên phải ra, làm mờ toàn bộ bối cảnh trang web bên dưới (Backdrop Blur Overlay).
 */
export default function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  if (!isOpen) return null;

  // Dữ liệu sản phẩm mẫu trong giỏ hàng để minh họa UI
  const mockCartItems = [
    {
      id: 1,
      name: 'Giày Bóng Đá Nike Mercurial Superfly 9',
      variant: 'Size 41 | Màu Xanh Neon',
      price: '3.490.000đ',
      quantity: 1,
      image: '/images/banners/sub_football_banner.png',
    },
    {
      id: 2,
      name: 'Vợt Cầu Lông Yonex Astrox 88D Pro',
      variant: '4U5 | Màu Đỏ Đen',
      price: '4.250.000đ',
      quantity: 1,
      image: '/images/banners/sub_badminton_volleyball_banner.png',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 1. Backdrop Blur Overlay (Mờ nền toàn trang web) */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* 2. Slide-Over Panel Trượt Bên Phải */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col justify-between animate-slide-left">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-black uppercase tracking-wider">GIỎ HÀNG CỦA BẠN</h2>
              <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                2
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-800/60">
            {mockCartItems.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex space-x-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 line-clamp-1 hover:text-orange-400 cursor-pointer transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.variant}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-extrabold text-orange-400">{item.price}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-slate-400">x{item.quantity}</span>
                      <button className="text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Drawer Footer & Checkout Action */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
            <div className="flex items-center justify-between text-base">
              <span className="text-slate-400 font-medium">Tạm tính:</span>
              <span className="text-xl font-black text-orange-400">7.740.000đ</span>
            </div>
            <p className="text-xs text-slate-500">Phí vận chuyển và mã giảm giá sẽ được tính ở trang checkout.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl text-sm transition-colors border border-slate-700"
              >
                XEM GIỎ HÀNG
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full text-center bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-1"
              >
                <span>THANH TOÁN</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
