package com.web.ap_sports.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Utility Component phát hành, băm HASH HMAC-SHA256 và kiểm tra tính hợp lệ của
 * JWT Tokens.
 * Sử dụng cặp khóa RSA 2048-bit (RS256) cho Access Token và HMAC-SHA256 cho
 * Refresh Token Hash.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    private final JwtKeyConfig jwtKeyConfig;

    @Value("${app.jwt.access-token-expiration-ms:1800000}")
    private long jwtAccessExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms:604800000}")
    private long jwtRefreshExpirationMs;

    @Value("${app.jwt.refresh-secret:${JWT_REFRESH_SECRET:default_refresh_secret}}")
    private String jwtRefreshSecret;

    /**
     * Sinh JWT Access Token ngắn hạn cho người dùng bằng thuật toán RS256 với RSA
     * Private Key.
     * 
     * @param userId ID của người dùng
     * @param email  Email đăng nhập
     * @param role   Tên vai trò (VD: CUSTOMER, ADMIN)
     * @return Chuỗi JWT Access Token
     */
    public String generateAccessToken(Long userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtAccessExpirationMs);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(jwtKeyConfig.getPrivateKey(), Jwts.SIG.RS256)
                .compact();
    }

    /**
     * Sinh chuỗi ngẫu nhiên làm Refresh Token gốc cho Client.
     */
    public String generateRawRefreshToken() {
        return UUID.randomUUID().toString() + "-" + System.currentTimeMillis();
    }

    /**
     * Băm HASH chuỗi Refresh Token gốc bằng thuật toán HMAC-SHA256 với khóa bí mật
     * JWT_REFRESH_SECRET.
     * 
     * @param rawToken Chuỗi token gốc từ Client
     * @return Chuỗi Hex Hash an toàn để lưu vào CSDL
     */
    public String hashRefreshToken(String rawToken) {
        try {
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            SecretKey secretKey = new SecretKeySpec(
                    jwtRefreshSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmacSha256.init(secretKey);
            byte[] hashBytes = hmacSha256.doFinal(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Lỗi mã hóa HMAC-SHA256 cho Refresh Token", e);
        }
    }

    /**
     * Lấy Claims từ Access Token sử dụng RSA Public Key.
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(jwtKeyConfig.getPublicKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Lấy UserId từ Access Token.
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Lấy Email từ Access Token.
     */
    public String getEmailFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("email", String.class);
    }

    /**
     * Lấy Role từ Access Token.
     */
    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        return claims.get("role", String.class);
    }

    /**
     * Kiểm tra tính hợp lệ của JWT Access Token bằng RSA Public Key.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(jwtKeyConfig.getPublicKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            log.warn("Kiểm tra tính hợp lệ JWT thất bại: {}", e.getMessage());
            return false;
        }
    }

    public long getRefreshExpirationMs() {
        return jwtRefreshExpirationMs;
    }
}
