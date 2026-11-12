package com.web.ap_sports.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Cấu hình Redis và Spring Cache cho toàn hệ thống AP Sports.
 * Tuân thủ quy tắc REDIS_AND_CACHE_RULES.md:
 * - Thiết lập TTL riêng cho danh mục tĩnh (12 giờ kèm Jitter ngẫu nhiên 1-5 phút chống Cache Avalanche).
 * - Không lưu giá trị null (chống Cache Penetration).
 * - Tích hợp CacheErrorHandler an toàn: nếu Redis gặp sự cố kết nối, tự động fallback đọc trực tiếp từ Database.
 */
@Configuration
@EnableCaching
@Slf4j
public class RedisConfig implements CachingConfigurer {

    /**
     * Khởi tạo RedisTemplate chuẩn hóa tuần tự hóa Key dạng chuỗi (String) và Value dạng JSON.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();

        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * Cấu hình RedisCacheManager quản lý các vùng nhớ đệm (Cache Regions).
     * Vùng nhớ 'categories' dùng cho Danh mục sản phẩm tĩnh có TTL 12 giờ + Jitter ngẫu nhiên (1-5 phút).
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        StringRedisSerializer keySerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer valueSerializer = new GenericJackson2JsonRedisSerializer();

        // Cấu hình mặc định (TTL 1 giờ)
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .disableCachingNullValues()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(keySerializer))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(valueSerializer));

        // Cộng thêm Jitter ngẫu nhiên 60 - 300 giây vào TTL 12 giờ của danh mục để chống Tuyết lở Cache (Cache Avalanche)
        long jitterSeconds = ThreadLocalRandom.current().nextLong(60, 301);
        RedisCacheConfiguration categoriesCacheConfig = defaultConfig
                .entryTtl(Duration.ofHours(12).plusSeconds(jitterSeconds))
                // Tắt prefix mặc định của Spring để key trên Redis hiển thị đúng chuẩn 'lvtn:dev:catalog:category:*'
                .computePrefixWith(cacheName -> "");

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        cacheConfigurations.put("categories", categoriesCacheConfig);

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }

    /**
     * Bộ xử lý lỗi Redis Cache an toàn (Fault-Tolerant Fallback):
     * Nếu Redis Server tạm thời mất kết nối, hệ thống chỉ ghi log cảnh báo và tự động truy vấn Database,
     * tuyệt đối không làm gián đoạn trải nghiệm duyệt web hoặc đặt hàng của khách hàng.
     */
    @Override
    @Bean
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("[Redis Fallback] Không thể đọc cache '{}' với key '{}', chuyển sang đọc trực tiếp từ Database: {}",
                        cache != null ? cache.getName() : "unknown", key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("[Redis Fallback] Không thể ghi cache '{}' với key '{}': {}",
                        cache != null ? cache.getName() : "unknown", key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("[Redis Fallback] Không thể xóa cache '{}' với key '{}': {}",
                        cache != null ? cache.getName() : "unknown", key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("[Redis Fallback] Không thể làm sạch vùng cache '{}': {}",
                        cache != null ? cache.getName() : "unknown", exception.getMessage());
            }
        };
    }
}
