package com.web.ap_sports.dto.request.support;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO yêu cầu đăng ký nhận thông báo khi có hàng.
 * Người dùng đã đăng nhập nên chỉ cần truyền variantId (biến thể đang xem).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRestockNotificationRequest {

    @NotNull(message = "Mã biến thể sản phẩm không được để trống")
    private Long variantId;

    // Email nhận tin tùy chọn nếu muốn đổi sang email khác, nếu null sẽ dùng email tài khoản
    private String customEmail;

    private String email;

    public String getEffectiveEmail() {
        if (customEmail != null && !customEmail.isBlank()) return customEmail.trim();
        if (email != null && !email.isBlank()) return email.trim();
        return null;
    }
}
