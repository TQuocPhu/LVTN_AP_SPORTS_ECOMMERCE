package com.web.ap_sports.config.annotation;

import java.lang.annotation.*;

/**
 * Annotation đánh dấu giới hạn tần suất gọi API (Rate Limiting).
 * Sử dụng Spring AOP kết hợp Redis (có fallback in-memory).
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RateLimit {

    /**
     * Tiền tố Key phân loại API (vd: "change_password", "avatar", "login").
     */
    String key() default "default";

    /**
     * Số lượt request tối đa được phép thực hiện trong khung thời gian.
     */
    int maxRequests() default 5;

    /**
     * Khung thời gian giới hạn (tính bằng giây). Mặc định: 900 giây (15 phút).
     */
    int windowSeconds() default 900;
}
