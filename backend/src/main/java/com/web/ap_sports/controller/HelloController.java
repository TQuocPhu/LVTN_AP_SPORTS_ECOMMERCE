package com.web.ap_sports.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        return Map.of(
            "status", "UP",
            "service", "Spring Boot 3.3.5 Backend (Java 21)",
            "timestamp", LocalDateTime.now().toString(),
            "message", "Backend is running smoothly!"
        );
    }
}
