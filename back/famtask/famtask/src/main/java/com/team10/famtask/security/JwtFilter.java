package com.team10.famtask.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        final String subject = jwtService.extractUsername(jwt);
        final String dni = jwtService.extractDni(jwt);
        String role = jwtService.extractRole(jwt);

        System.out.println("=== JWT FILTER === " + request.getRequestURI());
        System.out.println("dni=" + dni + " | role=" + role);
        System.out.println("===== DEBUG TIME =====");
        System.out.println("System.currentTimeMillis(): " + System.currentTimeMillis());
        System.out.println("new Date(): " + new java.util.Date());
        System.out.println("LocalDateTime.now(): " + java.time.LocalDateTime.now());
        System.out.println("ZoneId: " + java.time.ZoneId.systemDefault());
        System.out.println("======================");


        if (dni != null
                && SecurityContextHolder.getContext().getAuthentication() == null
                && jwtService.isTokenValid(jwt)) {

            String effRole = (role == null || role.isBlank()) ? "USER" : role.trim().toUpperCase();
            if (!effRole.startsWith("ROLE_")) {
                effRole = "ROLE_" + effRole;
            }

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            dni,
                            null,
                            List.of(new SimpleGrantedAuthority(effRole))
                    );

            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

            System.out.println("Authorities: " + auth.getAuthorities());
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();
        String method = request.getMethod();

        // 💥 FUNDAMENTAL: evitar que OPTIONS pase por este filtro
        if ("OPTIONS".equalsIgnoreCase(method)) {
            System.out.println("⏭️ Saltando JWT para OPTIONS " + path);
            return true;
        }

        // Endpoints públicos
        boolean skip =
                path.startsWith("/api/auth/") ||
                        path.startsWith("/api/google/") ||
                        path.startsWith("/swagger-ui/") ||
                        path.startsWith("/v3/api-docs/") ||
                        path.equals("/error");

        if (skip) {
            System.out.println("⏭️ Saltando JWT para: " + path);
        }

        return skip;
    }
}
