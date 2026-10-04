"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotificationContext } from "@/context/NotificationContext";
import { getCookie } from "@/services/api-client";

export default function NotificationBell() {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getCookie('accessToken'));
    const interval = setInterval(() => setHasToken(!!getCookie('accessToken')), 2000);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Ẩn chuông nếu chưa đăng nhập
  if (!hasToken) return null;

  const handleNotificationClick = async (id: number, url?: string) => {
    await markAsRead(id);
    setIsOpen(false);
    if (url) {
      // url có thể là /profile/orders/...
      window.location.href = url;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nav-icon-btn relative p-2.5 rounded-xl border transition-colors group flex items-center justify-center cursor-pointer"
        title="Thông báo"
      >
        <Bell className="w-5 h-5 group-hover:text-orange-500 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-current shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 z-50 animate-fade-in origin-top-right">
          <div className="nav-dropdown border rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: "var(--nav-dropdown-bg)", borderColor: "var(--nav-border)" }}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-3 px-4 border-b" style={{ borderColor: "var(--nav-border)" }}>
              <h3 className="font-bold text-sm" style={{ color: "var(--nav-text)" }}>Thông Báo</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="text-xs text-orange-500 hover:text-orange-400 font-medium flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" /> Đánh dấu đã đọc
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="flex flex-col">
                  {notifications.slice(0, 10).map((notif) => {
                    let payloadObj: any = {};
                    try {
                      payloadObj = JSON.parse(notif.payload || "{}");
                    } catch {}

                    return (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.targetUrl)}
                        className={`flex items-start gap-3 p-3 px-4 border-b last:border-b-0 text-left transition-colors hover:bg-orange-500/5 ${
                          notif.isRead ? "opacity-70" : "bg-orange-500/10"
                        }`}
                        style={{ borderColor: "var(--nav-border)" }}
                      >
                        <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notif.isRead ? "bg-transparent" : "bg-orange-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug" style={{ color: "var(--nav-text)" }}>
                            {notif.actionType === "ORDER_PLACED" ? `Đơn hàng mới #${payloadObj.orderCode || 'N/A'}` :
                             notif.actionType === "ORDER_SHIPPED" ? `Đơn hàng #${payloadObj.orderCode || 'N/A'} đang được giao` :
                             notif.actionType === "ORDER_CANCELLED" ? `Đơn hàng #${payloadObj.orderCode || 'N/A'} đã bị hủy` :
                             "Thông báo mới"}
                          </p>
                          <p className="text-xs mt-0.5 opacity-80 truncate" style={{ color: "var(--nav-text)" }}>
                            {notif.actionType === "ORDER_PLACED" ? `Khách hàng vừa đặt đơn hàng trị giá ${payloadObj.totalPrice || 0} VNĐ` :
                             "Nhấp để xem chi tiết"}
                          </p>
                          <p className="text-[10px] mt-1 text-orange-500 font-medium">
                            {new Date(notif.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center opacity-60 flex flex-col items-center">
                  <Bell className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm font-medium">Không có thông báo nào</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t text-center" style={{ borderColor: "var(--nav-border)" }}>
              <Link 
                href="/notifications" 
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-orange-500 hover:text-orange-400 py-1.5 block transition-colors"
              >
                Xem tất cả thông báo
              </Link>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
