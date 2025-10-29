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

        // subject = DNI (si así generaste el token)
        final String subject = jwtService.extractUsername(jwt);
        final String dni = jwtService.extractDni(jwt);
        final String role = jwtService.extractRole(jwt);

        // DEBUG opcional
        System.out.println("=== JWT FILTER === " + request.getRequestURI());
        System.out.println("SUB: " + subject + " | DNI: " + dni + " | ROLE: " + role);

        if (subject != null && SecurityContextHolder.getContext().getAuthentication() == null
                && jwtService.isTokenValid(jwt)) {

            String effRole = (role == null || role.isBlank()) ? "USER" : role.toUpperCase();
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            dni, // 👈 principal = DNI
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + effRole))
                    );

            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);

            System.out.println("Authorities: " + auth.getAuthorities());
        }

        filterChain.doFilter(request, response);
    }



    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        boolean shouldSkip = path.startsWith("/api/auth/");
        if (shouldSkip) {
            System.out.println("⏭️  Saltando filtro JWT para: " + path);
        }
        return shouldSkip;
    }
}
