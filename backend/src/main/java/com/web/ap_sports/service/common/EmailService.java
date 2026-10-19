package com.web.ap_sports.service.common;

/**
 * Interface cho dịch vụ gửi Email hệ thống.
 */
public interface EmailService {

    /**
     * Gửi Email chứa đường dẫn Kích hoạt tài khoản dạng HTML cho Khách hàng.
     * 
     * @param toEmail Email người nhận
     * @param userName Tên người nhận
     * @param activationToken Mã kích hoạt 64 ký tự
     */
    void sendActivationEmail(String toEmail, String userName, String activationToken);

    /**
     * Gửi Email chứa đường dẫn Đặt lại mật khẩu cho Khách hàng.
     * 
     * @param toEmail Email người nhận
     * @param userName Tên người nhận
     * @param resetToken Mã xác nhận đặt lại mật khẩu
     */
    void sendPasswordResetEmail(String toEmail, String userName, String resetToken);

    /**
     * Gửi Email trả lời thắc mắc / liên hệ cho Khách hàng từ Ban Quản Trị AP Sports.
     *
     * @param toEmail Email người nhận
     * @param customerName Tên khách hàng
     * @param originalMessage Câu hỏi / nội dung gốc khách hàng gửi
     * @param replyHtmlContent Nội dung câu trả lời từ ban quản trị (dạng HTML)
     */
    void sendContactReplyEmail(String toEmail, String customerName, String originalMessage, String replyHtmlContent);

    /**
     * Gửi Email xác nhận Đặt hàng thành công cho Khách hàng.
     *
     * @param toEmail Email người nhận
     * @param customerName Tên khách hàng
     * @param orderCode Mã đơn hàng
     * @param totalAmount Tổng số tiền thanh toán
     * @param paymentMethod Phương thức thanh toán
     */
    void sendOrderConfirmationEmail(String toEmail, String customerName, String orderCode, String totalAmount, String paymentMethod);

    /**
     * Gửi Hóa Đơn Điện Tử (E-Invoice) dạng HTML chuẩn doanh nghiệp qua Email cho Khách hàng.
     *
     * @param toEmail Email người nhận hóa đơn
     * @param orderDetail Chi tiết đơn hàng tài chính & sản phẩm
     */
    void sendEInvoiceEmail(String toEmail, com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse orderDetail);

    /**
     * Gửi Email thông báo Hàng Đã Về Kho (Restock Notification) dạng HTML cao cấp cho Khách hàng.
     *
     * @param toEmail Email người nhận
     * @param customerName Tên khách hàng
     * @param productName Tên sản phẩm
     * @param variantInfo Thuộc tính biến thể (Màu sắc, kích cỡ)
     * @param productSlug Đường dẫn định danh sản phẩm
     * @param variantPrice Giá bán hiện tại của biến thể
     * @param imageUrl Ảnh đại diện của sản phẩm/biến thể
     */
    void sendRestockAlertEmail(String toEmail, String customerName, String productName, String variantInfo, String productSlug, String variantPrice, String imageUrl);
}
