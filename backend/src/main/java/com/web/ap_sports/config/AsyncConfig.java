package com.web.ap_sports.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5); // Số lượng thread luôn giữ lại (ngay cả khi nhàn rỗi)
        executor.setMaxPoolSize(20); // Số lượng thread tối đa
        executor.setQueueCapacity(100); // Kích thước hàng đợi (nếu số lượng task vượt quá, sẽ dùng đến MaxPoolSize)
        executor.setThreadNamePrefix("AsyncThread-");
        executor.initialize();
        return executor;
    }
}
