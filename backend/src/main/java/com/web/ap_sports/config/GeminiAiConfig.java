package com.web.ap_sports.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Cấu hình bảo mật và kết nối Google Gemini Flash API.
 * Nạp thông tin cấu hình từ application.yml và biến môi trường .env.
 * Tuyệt đối không để lộ API Key ra phía client.
 */
@Configuration
@Getter
public class GeminiAiConfig {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.api-url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent}")
    private String apiUrl;

    @Value("${app.gemini.model:gemini-3.5-flash}")
    private String model;

    @Value("${app.gemini.fallback-model:gemini-3.5-flash-lite}")
    private String fallbackModel;

    @Value("${app.gemini.timeout-seconds:30}")
    private int timeoutSeconds;

    /**
     * Khởi tạo RestTemplate chuyên dụng gọi Google Gemini API với thiết lập Timeout an toàn,
     * tránh việc server bị treo khi mạng quốc tế chập chờn hoặc API bên thứ 3 chậm trễ.
     */
    @Bean(name = "geminiRestTemplate")
    public RestTemplate geminiRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(Math.max(15, timeoutSeconds)).toMillis());
        return new RestTemplate(factory);
    }

    public String getFallbackApiUrl() {
        return "https://generativelanguage.googleapis.com/v1beta/models/" + fallbackModel + ":generateContent";
    }
}
