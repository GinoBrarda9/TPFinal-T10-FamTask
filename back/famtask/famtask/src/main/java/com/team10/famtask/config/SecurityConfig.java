package com.team10.famtask.config;

import com.team10.famtask.security.JwtFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Profile("!test")
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 🔥 LOGGEO del 403/401
                .exceptionHandling(ex -> ex
                        .accessDeniedHandler((req, res, e) -> {
                            System.out.println("🔥 ACCESS DENIED HANDLER (403)");
                            System.out.println("➡ Exception: " + e.getClass().getSimpleName());
                            System.out.println("➡ Message: " + e.getMessage());
                            res.sendError(HttpServletResponse.SC_FORBIDDEN);
                        })
                        .authenticationEntryPoint((req, res, e) -> {
                            var auth = SecurityContextHolder.getContext().getAuthentication();

                            System.out.println("🚫 AUTH ENTRY POINT (401/403)");
                            System.out.println("➡ URI: " + req.getRequestURI());
                            System.out.println("➡ Exception: " + e.getClass().getSimpleName());
                            System.out.println("➡ Message: " + e.getMessage());
                            System.out.println("➡ Auth at entry point: " + auth);

                            res.sendError(HttpServletResponse.SC_FORBIDDEN);
                        })

                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/api/auth/google/**",
                                "/api/google/auth/**",
                                "/api/google/callback/**",
                                "/error"
                        ).permitAll()

                        .requestMatchers("/api/profile/**")
                        .hasAnyRole("USER","ADMIN","MEMBER")

                        .requestMatchers(HttpMethod.POST, "/api/families/**").hasRole("ADMIN")
                        .requestMatchers("/api/families/**").authenticated()

                        .requestMatchers("/api/events/**").authenticated()
                        .requestMatchers("/api/calendar/**").authenticated()

                        .requestMatchers("/api/homepage/**").permitAll()

                        .requestMatchers("/api/invitations/**").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/**").authenticated()

                        // Board
                        .requestMatchers("/api/board/**").authenticated()

                        // Cards
                        .requestMatchers("/api/cards/**").authenticated()

                        .anyRequest().authenticated()
                )

                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
