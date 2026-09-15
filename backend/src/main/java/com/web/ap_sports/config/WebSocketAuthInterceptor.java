package com.web.ap_sports.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

/**
 * Interceptor kiểm tra JWT Access Token trong STOMP CONNECT Frame cho kết nối WebSocket.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String token = null;

            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            } else if (StringUtils.hasText(authHeader)) {
                token = authHeader;
            } else {
                // Thử lấy token từ header "token" tùy chọn
                token = accessor.getFirstNativeHeader("token");
            }

            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                String email = jwtTokenProvider.getEmailFromToken(token);
                String role = jwtTokenProvider.getRoleFromToken(token);

                if (email != null && role != null) {
                    String authorityName = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority(authorityName)
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(email, null, authorities);

                    accessor.setUser(authentication);
                    log.info("WebSocket STOMP CONNECT thành công cho user ID: {}, email: {}", userId, email);
                }
            } else {
                log.warn("WebSocket STOMP CONNECT bị từ chối: Token không hợp lệ hoặc thiếu header Authorization.");
                throw new IllegalArgumentException("Xác thực WebSocket thất bại: Token JWT không hợp lệ.");
            }
        }

        return message;
    }
}
