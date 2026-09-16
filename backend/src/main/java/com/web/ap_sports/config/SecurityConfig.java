package com.web.ap_sports.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.expression.DefaultWebSecurityExpressionHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Instant;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Khai báo static Bean cho RoleHierarchy để tránh vướng premature proxying trong Spring Security 6.x.
     * Đồng bộ 100% tên vai trò với UserRole enum (ADMIN, STAFF, WAREHOUSE_MANAGER, CUSTOMER).
     */
    @Bean
    public static RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy(
                "ROLE_ADMIN > ROLE_WAREHOUSE_MANAGER\n" +
                "ROLE_ADMIN > ROLE_STAFF\n" +
                "ROLE_ADMIN > ROLE_CUSTOMER\n" +
                "ROLE_WAREHOUSE_MANAGER > ROLE_CUSTOMER\n" +
                "ROLE_STAFF > ROLE_CUSTOMER"
        );
    }

    @Bean
    public DefaultWebSecurityExpressionHandler customWebSecurityExpressionHandler(RoleHierarchy roleHierarchy) {
        DefaultWebSecurityExpressionHandler expressionHandler = new DefaultWebSecurityExpressionHandler();
        expressionHandler.setRoleHierarchy(roleHierarchy);
        return expressionHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(customAuthenticationEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            )
            .authorizeHttpRequests(auth -> auth
                // 1. PermitAll: Auth Endpoints, Public Catalog, Handshake WebSocket /ws/**, H2 Console
                .requestMatchers(
                        "/api/v1/admin/auth/login",
                        "/api/v1/customer/auth/register",
                        "/api/v1/customer/auth/activate",
                        "/api/v1/customer/auth/login",
                        "/api/v1/customer/auth/logout",
                        "/api/v1/customer/auth/refresh",
                        "/api/v1/customer/auth/forgot-password",
                        "/api/v1/customer/auth/reset-password",
                        "/api/v1/auth/**",
                        "/api/v1/products/**",
                        "/api/v1/categories/**",
                        "/ws/**",
                        "/h2-console/**"
                ).permitAll()

                // 2. Protected Routes theo Role (Đồng bộ 100% với UserRole enum & DB roles)
                .requestMatchers("/api/v1/customer/auth/me").hasRole("CUSTOMER")
                .requestMatchers("/api/v1/customer/profile/**", "/api/v1/customer/addresses/**").hasRole("CUSTOMER")
                .requestMatchers("/api/v1/admin/auth/me", "/api/v1/admin/auth/logout").hasAnyRole("ADMIN", "STAFF", "WAREHOUSE_MANAGER")
                .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "STAFF", "WAREHOUSE_MANAGER")
                .requestMatchers("/api/v1/warehouse/**").hasRole("WAREHOUSE_MANAGER")
                .requestMatchers("/api/v1/staff/**").hasRole("STAFF")

                // 3. Mặc định tất cả các request khác phải được xác thực
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            String json = String.format(
                    "{\"status\":401,\"message\":\"Chưa đăng nhập hoặc phiên làm việc hết hạn.\",\"timestamp\":\"%s\"}",
                    Instant.now().toString()
            );
            response.getWriter().write(json);
        };
    }

    @Bean
    public AccessDeniedHandler customAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            String json = String.format(
                    "{\"status\":403,\"message\":\"Bạn không có quyền truy cập tài nguyên này.\",\"timestamp\":\"%s\"}",
                    Instant.now().toString()
            );
            response.getWriter().write(json);
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
