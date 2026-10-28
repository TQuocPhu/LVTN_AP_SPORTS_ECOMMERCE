package com.web.ap_sports.auth;

import com.web.ap_sports.config.JwtAuthenticationFilter;
import com.web.ap_sports.config.JwtKeyConfig;
import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.config.annotation.RateLimit;
import com.web.ap_sports.config.aspect.RateLimitAspect;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.exception.RateLimitExceededException;
import com.web.ap_sports.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import org.aspectj.lang.ProceedingJoinPoint;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.annotation.Annotation;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Hạ tầng Bảo mật: JwtTokenProvider (RS256 & HMAC-SHA256),
 * JwtAuthenticationFilter & RateLimitAspect (Bao phủ Nhóm 8: TC-AUTH-22 & TC-AUTH-23).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("JWT Provider, Auth Filter & RateLimit Aspect Unit Tests")
class JwtAndSecurityInfrastructureTest {

    private JwtKeyConfig jwtKeyConfig;
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private UserRepository userRepository;
    @Mock
    private FilterChain filterChain;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private ProceedingJoinPoint joinPoint;

    @BeforeEach
    void setUp() {
        jwtKeyConfig = new JwtKeyConfig(new DefaultResourceLoader());
        ReflectionTestUtils.setField(jwtKeyConfig, "privateKeyPath", "classpath:keys/private_key.pem");
        ReflectionTestUtils.setField(jwtKeyConfig, "publicKeyPath", "classpath:keys/public_key.pem");
        jwtKeyConfig.init();

        jwtTokenProvider = new JwtTokenProvider(jwtKeyConfig);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtAccessExpirationMs", 1800000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtRefreshExpirationMs", 604800000L);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtRefreshSecret", "test_hmac_sha256_secret_key_for_refresh_token");
        ReflectionTestUtils.setField(jwtTokenProvider, "refreshTokenAbsoluteMaxDays", 30L);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // =========================================================================
    // TC-AUTH-22: JWT TOKEN PROVIDER & JWT AUTHENTICATION FILTER
    // =========================================================================
    @Nested
    @DisplayName("TC-AUTH-22: JwtTokenProvider (RS256/HMAC-SHA256) & JwtAuthenticationFilter")
    class JwtProviderAndFilterTests {

        @Test
        @DisplayName("TC-AUTH-22.1: Sinh và xác thực JWT Access Token bằng cặp khóa bất đối xứng RSA 2048-bit (RS256)")
        void generateAndValidateRs256Token_Success() {
            String token = jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER");

            assertNotNull(token);
            assertTrue(jwtTokenProvider.validateToken(token));
            assertEquals(100L, jwtTokenProvider.getUserIdFromToken(token));
            assertEquals("customer@example.com", jwtTokenProvider.getEmailFromToken(token));
            assertEquals("CUSTOMER", jwtTokenProvider.getRoleFromToken(token));
        }

        @Test
        @DisplayName("TC-AUTH-22.2: Từ chối JWT giả mạo chữ ký hoặc đã hết hạn")
        void validateToken_Fail_TamperedOrExpired() {
            ReflectionTestUtils.setField(jwtTokenProvider, "jwtAccessExpirationMs", -5000L); // Đã hết hạn 5 giây trước
            String expiredToken = jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER");

            assertFalse(jwtTokenProvider.validateToken(expiredToken));
            assertFalse(jwtTokenProvider.validateToken("eyJhbGciOiJSUzI1NiJ9.tampered.signature"));
        }

        @Test
        @DisplayName("TC-AUTH-22.3: Băm Refresh Token bằng HMAC-SHA256 tạo chuỗi Hex 64 ký tự nhất quán")
        void hashRefreshToken_HmacSha256_Consistent() {
            String raw = jwtTokenProvider.generateRawRefreshToken();
            String hash1 = jwtTokenProvider.hashRefreshToken(raw);
            String hash2 = jwtTokenProvider.hashRefreshToken(raw);

            assertEquals(64, hash1.length());
            assertEquals(hash1, hash2);
            assertNotEquals(raw, hash1);
        }

        @Test
        @DisplayName("TC-AUTH-22A: Filter ưu tiên đọc JWT từ Cookie trước Header Authorization & nạp SecurityContext")
        void filter_Success_CookiePriorityAndSetsSecurityContext() throws Exception {
            JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtTokenProvider, userRepository);
            String validJwt = jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER");

            User activeUser = User.builder().id(100L).email("customer@example.com").status(UserStatus.active).build();
            when(userRepository.findById(100L)).thenReturn(Optional.of(activeUser));

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setCookies(new Cookie("accessToken", validJwt));
            request.addHeader("Authorization", "Bearer invalid-header-token");
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilter(request, response, filterChain);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            assertNotNull(auth);
            assertEquals("customer@example.com", auth.getPrincipal());
            assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")));
            verify(filterChain, times(1)).doFilter(request, response);
        }

        @Test
        @DisplayName("TC-AUTH-22B: Chặn tức thời (HTTP 403) tại Filter nếu User vừa bị khóa (banned) dù JWT còn hạn")
        void filter_BlockImmediately_WhenUserBannedInDatabase() throws Exception {
            JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtTokenProvider, userRepository);
            String validJwt = jwtTokenProvider.generateAccessToken(100L, "banned@example.com", "CUSTOMER");

            User bannedUser = User.builder().id(100L).email("banned@example.com").status(UserStatus.banned).build();
            when(userRepository.findById(100L)).thenReturn(Optional.of(bannedUser));

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader("Authorization", "Bearer " + validJwt);
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilter(request, response, filterChain);

            assertEquals(403, response.getStatus());
            assertTrue(response.getContentAsString().contains("Tài khoản của bạn đã bị khóa"));
            assertNull(SecurityContextHolder.getContext().getAuthentication());
            verify(filterChain, never()).doFilter(any(), any());
        }
    }

    // =========================================================================
    // TC-AUTH-23: RATE LIMIT ASPECT (REDIS & IN-MEMORY FALLBACK)
    // =========================================================================
    @Nested
    @DisplayName("TC-AUTH-23: RateLimitAspect chống Brute-Force (Redis & In-Memory Fallback)")
    class RateLimitAspectTests {

        private RateLimit createRateLimitAnnotation(String key, int maxRequests, int windowSeconds) {
            return new RateLimit() {
                @Override
                public Class<? extends Annotation> annotationType() {
                    return RateLimit.class;
                }
                @Override
                public String key() {
                    return key;
                }
                @Override
                public int maxRequests() {
                    return maxRequests;
                }
                @Override
                public int windowSeconds() {
                    return windowSeconds;
                }
            };
        }

        @Test
        @DisplayName("TC-AUTH-23A: Chặn request thứ 6 bằng Redis khi vượt ngưỡng maxRequests = 5")
        void rateLimit_RedisMode_BlocksExceedingRequest() throws Throwable {
            RateLimitAspect aspect = new RateLimitAspect(redisTemplate);
            RateLimit rateLimit = createRateLimitAnnotation("login", 5, 60);

            when(redisTemplate.opsForValue()).thenReturn(valueOperations);
            when(valueOperations.increment(anyString())).thenReturn(1L, 2L, 3L, 4L, 5L, 6L);
            when(joinPoint.proceed()).thenReturn("OK");

            // 5 lần đầu thành công
            for (int i = 0; i < 5; i++) {
                assertEquals("OK", aspect.checkRateLimit(joinPoint, rateLimit));
            }

            // Lần thứ 6 ném RateLimitExceededException
            RateLimitExceededException ex = assertThrows(RateLimitExceededException.class,
                    () -> aspect.checkRateLimit(joinPoint, rateLimit));

            assertEquals(60, ex.getRetryAfterSeconds());
            assertTrue(ex.getMessage().contains("(5/5)"));
        }

        @Test
        @DisplayName("TC-AUTH-23B: Tự động Fallback sang In-Memory khi Redis sập và vẫn chặn đúng ở lần thứ 4 (maxRequests = 3)")
        void rateLimit_RedisDown_FallbackToInMemoryAndBlocksCorrectly() throws Throwable {
            RateLimitAspect aspect = new RateLimitAspect(redisTemplate);
            RateLimit rateLimit = createRateLimitAnnotation("forgot_password", 3, 600);

            when(redisTemplate.opsForValue()).thenThrow(new RedisConnectionFailureException("Redis connection refused"));
            when(joinPoint.proceed()).thenReturn("FALLBACK_OK");

            // 3 lần đầu đi qua nhờ In-Memory Fallback
            for (int i = 0; i < 3; i++) {
                assertEquals("FALLBACK_OK", aspect.checkRateLimit(joinPoint, rateLimit));
            }

            // Lần thứ 4 bị chặn bởi In-Memory Fallback
            RateLimitExceededException ex = assertThrows(RateLimitExceededException.class,
                    () -> aspect.checkRateLimit(joinPoint, rateLimit));

            assertEquals(600, ex.getRetryAfterSeconds());
            assertTrue(ex.getMessage().contains("(3/3)"));
        }
    }
}
