"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useNotificationContext } from "@/context/NotificationContext";

export default function NotificationList() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();

  const handleNotificationClick = async (id: number, url?: string) => {
    await markAsRead(id);
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wide">Thông Báo Của Bạn</h1>
            <p className="text-sm opacity-70">
              Bạn có {unreadCount} thông báo chưa đọc
            </p>
          </div>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white font-bold transition-colors text-sm border border-orange-500/20 hover:border-transparent cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: "var(--nav-border)", backgroundColor: "var(--nav-dropdown-bg)" }}>
        {notifications.length > 0 ? (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--nav-border)" }}>
            {notifications.map((notif) => {
              let payloadObj: any = {};
              try {
                payloadObj = JSON.parse(notif.payload || "{}");
              } catch {}

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.targetUrl)}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 transition-colors cursor-pointer hover:bg-orange-500/5 ${
                    notif.isRead ? "opacity-75" : "bg-orange-500/10"
                  }`}
                >
                  <div className="flex-1 flex gap-4">
                    <div className="mt-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${notif.isRead ? "bg-transparent" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1" style={{ color: "var(--nav-text)" }}>
                        {notif.actionType === "ORDER_PLACED" ? `Đơn hàng mới #${payloadObj.orderCode || 'N/A'}` :
                         notif.actionType === "ORDER_SHIPPED" ? `Đơn hàng #${payloadObj.orderCode || 'N/A'} đang được giao` :
                         notif.actionType === "ORDER_CANCELLED" ? `Đơn hàng #${payloadObj.orderCode || 'N/A'} đã bị hủy` :
                         "Thông báo hệ thống"}
                      </h3>
                      <p className="text-sm opacity-80 mb-2 leading-relaxed max-w-2xl" style={{ color: "var(--nav-text)" }}>
                        {notif.actionType === "ORDER_PLACED" ? `Khách hàng vừa đặt đơn hàng trị giá ${payloadObj.totalPrice || 0} VNĐ. Vui lòng kiểm tra và xác nhận.` :
                         "Vui lòng nhấn vào thông báo để xem chi tiết."}
                      </p>
                      <p className="text-xs font-medium text-orange-500 flex items-center gap-2">
                        {new Date(notif.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500 mb-4">
              <Bell className="w-10 h-10 opacity-50" />
            </div>
            <h3 className="text-lg font-bold mb-2">Chưa có thông báo nào</h3>
            <p className="text-sm opacity-70 max-w-sm">
              Bạn chưa có thông báo nào trong hộp thư. Khi có sự kiện mới, thông báo sẽ xuất hiện tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
