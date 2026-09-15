package com.web.ap_sports.config;

import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.nio.file.Files;

/**
 * Cấu hình tự động nạp các biến môi trường từ file .env vào System Properties 
 * để Spring Boot có thể giải mã ${MAIL_USERNAME}, ${MAIL_PASSWORD}, ${JWT_SECRET}... 
 * mà không cần hardcode bất kỳ secret nào trong mã nguồn hoặc application.yml.
 */
@Configuration
public class EnvConfig {

    static {
        loadEnvFile();
    }

    private static void loadEnvFile() {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("backend/.env");
        }

        if (envFile.exists()) {
            try {
                Files.readAllLines(envFile.toPath()).forEach(line -> {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("#") && trimmed.contains("=")) {
                        int idx = trimmed.indexOf('=');
                        String key = trimmed.substring(0, idx).trim();
                        String value = trimmed.substring(idx + 1).trim();
                        if (!key.isEmpty() && System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                });
            } catch (Exception ignored) {
            }
        }
    }
}
