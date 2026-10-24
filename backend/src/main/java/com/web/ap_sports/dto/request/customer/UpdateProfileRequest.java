package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO cập nhật thông tin cá nhân của Khách hàng.
 * Lưu ý nghiệp vụ:
 * - Giữ nguyên `@NotBlank` cho `name` để Spring Validation tự động trả về `fieldErrors.name` chuẩn cho Frontend.
 * - Với tài khoản Google (`google_id != null`): ô `name` trên giao diện bị khóa (luôn gửi kèm tên Google hiện tại),
 *   và tầng Service sẽ giữ nguyên tên gốc từ Google, chỉ cập nhật `phoneNumber` (và `address`).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
    private String name;

    @Pattern(regexp = "^(|(0|\\+84)[3|5|7|8|9][0-9]{8})$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    @Size(max = 500, message = "Địa chỉ không được vượt quá 500 ký tự")
    private String address;
}
