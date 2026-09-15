package com.web.ap_sports.config.aspect;

import com.web.ap_sports.config.annotation.RateLimit;
import com.web.ap_sports.exception.RateLimitExceededException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Aspect xử lý Rate Limiting tự động cho các phương thức được đánh dấu @RateLimit.
 * Ưu tiên sử dụng Redis Key TTL. Tự động Fallback sang In-Memory nếu Redis gián đoạn.
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {

    private final StringRedisTemplate redisTemplate;

    // Bộ nhớ đệm Fallback In-Memory phòng trường hợp Redis không khả dụng
    private final Map<String, InMemoryCounter> fallbackCache = new ConcurrentHashMap<>();

    @Around("@annotation(rateLimit)")
    public Object checkRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String identifier = getClientIdentifier();
        String redisKey = String.format("lvtn:rate:%s:%s", rateLimit.key(), identifier);
        int maxRequests = rateLimit.maxRequests();
        int windowSeconds = rateLimit.windowSeconds();

        boolean allowed = isAllowed(redisKey, maxRequests, windowSeconds);

        if (!allowed) {
            int minutes = Math.max(1, windowSeconds / 60);
            log.warn("Rate limit vượt quá cho identifier: {}, key: {}", identifier, rateLimit.key());
            throw new RateLimitExceededException(
                    String.format("Bạn đã thao tác quá nhiều lần (%d/%d). Vui lòng thử lại sau %d phút.",
                            maxRequests, maxRequests, minutes),
                    windowSeconds
            );
        }

        return joinPoint.proceed();
    }

    private boolean isAllowed(String redisKey, int maxRequests, int windowSeconds) {
        try {
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1) {
                redisTemplate.expire(redisKey, Duration.ofSeconds(windowSeconds));
            }
            return count != null && count <= maxRequests;
        } catch (Exception e) {
            log.warn("Redis không khả dụng cho Rate Limit [{}]. Chuyển sang Fallback In-Memory: {}", redisKey, e.getMessage());
            return checkInMemoryFallback(redisKey, maxRequests, windowSeconds);
        }
    }

    private synchronized boolean checkInMemoryFallback(String key, int maxRequests, int windowSeconds) {
        long now = System.currentTimeMillis();
        InMemoryCounter counter = fallbackCache.get(key);

        if (counter == null || now > counter.expiryTime) {
            fallbackCache.put(key, new InMemoryCounter(1, now + (windowSeconds * 1000L)));
            return true;
        }

        if (counter.count < maxRequests) {
            counter.count++;
            return true;
        }

        return false;
    }

    private String getClientIdentifier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return "user:" + auth.getName();
        }

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return "ip:" + xForwardedFor.split(",")[0].trim();
            }
            return "ip:" + request.getRemoteAddr();
        }

        return "unknown";
    }

    private static class InMemoryCounter {
        int count;
        long expiryTime;

        InMemoryCounter(int count, long expiryTime) {
            this.count = count;
            this.expiryTime = expiryTime;
        }
    }
}
