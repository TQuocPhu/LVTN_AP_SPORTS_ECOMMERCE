package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO cho chức năng Đăng ký tài khoản Khách hàng.
 */
@Data
public class RegisterCustomerRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 255, message = "Họ và tên không được vượt quá 255 ký tự")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 255, message = "Email không được vượt quá 255 ký tự")
    private String email;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, message = "Mật khẩu mới phải có tối thiểu 8 ký tự")
    @Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
        message = "Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số"
    )
    private String password;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    private String confirmPassword;
}
