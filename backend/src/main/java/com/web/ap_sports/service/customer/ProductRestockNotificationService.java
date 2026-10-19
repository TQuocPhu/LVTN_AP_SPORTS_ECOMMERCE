package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.support.RegisterRestockNotificationRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.support.RestockNotificationResponse;

/**
 * Service quản lý luồng đăng ký và gửi thông báo khi sản phẩm/biến thể về hàng (Restock Alert).
 */
public interface ProductRestockNotificationService {

    /**
     * Đăng ký nhận thông báo khi biến thể sản phẩm có hàng trở lại.
     *
     * @param userId ID tài khoản khách hàng đã đăng nhập
     * @param request Thông tin biến thể cần đăng ký
     * @return Thông tin kết quả đăng ký
     */
    RestockNotificationResponse registerNotification(Long userId, RegisterRestockNotificationRequest request);

    /**
     * Hủy đăng ký nhận thông báo cho biến thể sản phẩm.
     *
     * @param userId ID khách hàng
     * @param variantId ID biến thể
     * @return Kết quả hủy đăng ký
     */
    ApiResponse<Void> cancelNotification(Long userId, Long variantId);

    /**
     * Kiểm tra xem khách hàng hiện tại đã đăng ký nhận tin cho biến thể này chưa.
     *
     * @param userId ID khách hàng
     * @param variantId ID biến thể
     * @return true nếu đang có yêu cầu PENDING, ngược lại false
     */
    boolean isSubscribed(Long userId, Long variantId);

    /**
     * Kích hoạt quét và gửi thông báo (Email + WebSocket) cho tất cả khách hàng đang đăng ký
     * khi một biến thể được nhập kho có số lượng tồn kho > 0.
     *
     * @param variantId ID biến thể vừa được nhập kho
     * @param newQuantity Số lượng tồn kho mới sau nhập
     */
    void notifySubscribersForRestockedVariant(Long variantId, int newQuantity);
}
