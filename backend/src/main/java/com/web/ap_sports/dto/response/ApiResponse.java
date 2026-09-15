package com.web.ap_sports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Class bọc phản hồi API chuẩn hóa toàn hệ thống (API Response Wrapper).
 * 
 * @param <T> Kiểu dữ liệu chứa trong field data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    /**
     * Mã trạng thái HTTP hoặc Custom Business Code (VD: 200, 400, 401, 404).
     */
    private int status;

    /**
     * Thông điệp giải thích kết quả xử lý.
     */
    private String message;

    /**
     * Dữ liệu phản hồi trả về cho Client.
     */
    private T data;

    /**
     * Thời điểm phản hồi được tạo.
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Phản hồi thành công có dữ liệu.
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Phản hồi thành công có dữ liệu không có thông điệp tùy chỉnh.
     */
    public static <T> ApiResponse<T> success(T data) {
        return success("Thao tác thành công", data);
    }

    /**
     * Phản hồi thành công không có dữ liệu trả về (VD: Đăng xuất, Kích hoạt tài khoản).
     */
    public static <T> ApiResponse<T> success(String message) {
        return success(message, null);
    }

    /**
     * Phản hồi lỗi tùy chỉnh mã HTTP status code và dữ liệu lỗi.
     */
    public static <T> ApiResponse<T> error(int status, String message, T data) {
        return ApiResponse.<T>builder()
                .status(status)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Phản hồi lỗi tùy chỉnh mã HTTP status code.
     */
    public static <T> ApiResponse<T> error(int status, String message) {
        return error(status, message, null);
    }
}
