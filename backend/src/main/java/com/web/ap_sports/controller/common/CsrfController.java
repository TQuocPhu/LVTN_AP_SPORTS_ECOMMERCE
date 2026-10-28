package com.web.ap_sports.controller.common;

import com.web.ap_sports.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller cung cấp endpoint khởi tạo và cấp phát CSRF Token cho Frontend Single Page App.
 */
@RestController
@RequestMapping("/api/v1/csrf")
public class CsrfController {

    @GetMapping
    public ResponseEntity<ApiResponse<String>> getCsrfToken(CsrfToken csrfToken) {
        String tokenValue = csrfToken != null ? csrfToken.getToken() : null;
        return ResponseEntity.ok(ApiResponse.success("CSRF token initialized", tokenValue));
    }
}

