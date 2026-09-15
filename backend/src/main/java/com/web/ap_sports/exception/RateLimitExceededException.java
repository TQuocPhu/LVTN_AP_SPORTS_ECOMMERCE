package com.web.ap_sports.exception;

import lombok.Getter;

/**
 * Ngoại lệ ném ra khi người dùng vượt quá số lượt gọi API cho phép (HTTP 429 Too Many Requests).
 */
@Getter
public class RateLimitExceededException extends RuntimeException {

    private final int retryAfterSeconds;

    public RateLimitExceededException(String message, int retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
