package com.web.ap_sports.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter đảm bảo Deferred CsrfToken của Spring Security 6 luôn được sinh
 * và render ra cookie "XSRF-TOKEN" cho Frontend Single Page App (Next.js/React).
 */
public class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            // Gọi .getToken() để buộc Spring Security giải phóng token ra response cookie
            csrfToken.getToken();
        }
        filterChain.doFilter(request, response);
    }
}
