package com.web.ap_sports.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.MessageDeliveryException;
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
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.repository.UserRepository;

@Component
@RequiredArgsConstructor 
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message; // heartbeat
        }

        StompCommand command = accessor.getCommand();

        if (StompCommand.CONNECT.equals(command)) {
            accessor.setUser(authenticate(accessor));
            return message;
        }

        if (StompCommand.DISCONNECT.equals(command)) {
            return message;
        }

        // Mọi frame còn lại bắt buộc đã xác thực
        if (accessor.getUser() == null) {
            throw new MessageDeliveryException("Chưa xác thực WebSocket.");
        }

        if (StompCommand.SUBSCRIBE.equals(command)) {
            String destination = accessor.getDestination();
            if (!"/user/queue/notifications".equals(destination) && (destination == null || !destination.startsWith("/topic/"))) {
                log.warn("SUBSCRIBE bị từ chối: {}", destination);
                throw new MessageDeliveryException("Không có quyền subscribe destination này.");
            }
        } else if (StompCommand.SEND.equals(command)) {
            throw new MessageDeliveryException("Không cho phép gửi message lên server.");
        }

        return message;
    }

    private org.springframework.security.core.Authentication authenticate(StompHeaderAccessor accessor) {
        // Ưu tiên header Authorization (Mobile), fallback cookie accessToken đã lấy lúc handshake (Web)
        String token = null;
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (accessor.getSessionAttributes() != null) {
            Object cookieToken = accessor.getSessionAttributes()
                    .get(WebSocketCookieHandshakeInterceptor.ACCESS_TOKEN_ATTR);
            if (cookieToken instanceof String s && StringUtils.hasText(s)) {
                token = s;
            }
        }
        if (token == null) {
            throw new MessageDeliveryException("Thiếu token.");
        }

        if (!jwtTokenProvider.validateToken(token)) {
            throw new MessageDeliveryException("Token không hợp lệ.");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        String role = jwtTokenProvider.getRoleFromToken(token);
        if (userId == null || role == null) {
            throw new MessageDeliveryException("Token thiếu thông tin.");
        }

        boolean active = userRepository.findById(userId)
                .map(u -> u.getStatus() == UserStatus.active)
                .orElse(false);
        if (!active) {
            throw new MessageDeliveryException("Tài khoản bị khóa.");
        }

        String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        log.info("STOMP CONNECT thành công, userId={}", userId);

        // Principal name PHẢI là userId để khớp convertAndSendToUser
        return new UsernamePasswordAuthenticationToken(
                String.valueOf(userId), null,
                List.of(new SimpleGrantedAuthority(authority)));
    }
}
