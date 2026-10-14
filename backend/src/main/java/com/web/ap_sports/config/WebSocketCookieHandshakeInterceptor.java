package com.web.ap_sports.config;

import com.web.ap_sports.util.CookieUtils;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Đọc HttpOnly Cookie "accessToken" ở bước HTTP Handshake của WebSocket/SockJS
 * và lưu vào session attributes. JS phía client không đọc được HttpOnly cookie,
 * nên STOMP CONNECT sẽ dùng token này thay cho header Authorization.
 */
@Component
public class WebSocketCookieHandshakeInterceptor implements HandshakeInterceptor {

    public static final String ACCESS_TOKEN_ATTR = "WS_ACCESS_TOKEN";

    @Override
    public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                                   @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            String token = CookieUtils.extractCookieValue(
                    servletRequest.getServletRequest(), CookieUtils.ACCESS_TOKEN_COOKIE_NAME);
            if (token != null && !token.isBlank()) {
                attributes.put(ACCESS_TOKEN_ATTR, token);
            }
        }
        return true; // Việc chặn/cho phép do WebSocketAuthInterceptor quyết định ở frame CONNECT
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                               @NonNull WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }
}
