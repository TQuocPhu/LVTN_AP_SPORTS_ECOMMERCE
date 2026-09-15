package com.web.ap_sports.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Utility Component nạp cặp khóa RSA 2048-bit (RS256 Private Key & Public Key) cho JWT Signing.
 * Có cơ chế Fail-Fast kiểm tra ngay trong @PostConstruct khi khởi động ứng dụng.
 */
@Component
@Getter
@Slf4j
public class JwtKeyConfig {

    @Value("${app.jwt.private-key-path:classpath:keys/private_key.pem}")
    private String privateKeyPath;

    @Value("${app.jwt.public-key-path:classpath:keys/public_key.pem}")
    private String publicKeyPath;

    private final ResourceLoader resourceLoader;

    private PrivateKey privateKey;
    private PublicKey publicKey;

    public JwtKeyConfig(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void init() {
        try {
            log.info("Đang nạp cặp khóa RSA 2048-bit từ đường dẫn: private={}, public={}", privateKeyPath, publicKeyPath);
            this.privateKey = loadPrivateKey(privateKeyPath);
            this.publicKey = loadPublicKey(publicKeyPath);
            log.info("Nạp cặp khóa RSA 2048-bit (RS256) thành công!");
        } catch (Exception e) {
            log.error("LỖI KHỞI ĐỘNG NGHIÊM TRỌNG: Không thể nạp cặp khóa RSA cho RS256 JWT Signing", e);
            throw new IllegalStateException("Lỗi nạp khóa RSA 2048-bit cho JWT RS256", e);
        }
    }

    private PrivateKey loadPrivateKey(String location) throws Exception {
        Resource resource = resourceLoader.getResource(location);
        try (InputStream is = resource.getInputStream()) {
            String pem = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            String privateKeyPEM = pem
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s+", "");

            byte[] encoded = Base64.getDecoder().decode(privateKeyPEM);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encoded);
            return keyFactory.generatePrivate(keySpec);
        }
    }

    private PublicKey loadPublicKey(String location) throws Exception {
        Resource resource = resourceLoader.getResource(location);
        try (InputStream is = resource.getInputStream()) {
            String pem = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            String publicKeyPEM = pem
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");

            byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
            return keyFactory.generatePublic(keySpec);
        }
    }
}
