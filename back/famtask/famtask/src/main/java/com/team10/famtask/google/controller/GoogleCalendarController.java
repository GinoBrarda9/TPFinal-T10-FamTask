package com.team10.famtask.google.controller;

import com.team10.famtask.google.service.GoogleOAuthService;
import com.team10.famtask.repository.family.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/google/calendar")
@RequiredArgsConstructor
public class GoogleCalendarController {
    private final UserRepository userRepository;

    private final GoogleOAuthService googleOAuthService;
    private String getLoggedUserDni() {

        return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
    @GetMapping("/auth/url")
    public ResponseEntity<Map<String, String>> getCalendarAuthUrl(@RequestParam String dni) {
        String url = googleOAuthService.generateCalendarAuthUrl(dni);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/callback")
    public void handleCalendarCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String dni,
            HttpServletResponse response
    ) throws IOException {

        // Si Google no devuelve 'state', uso el DNI del usuario logueado
        if (dni == null || dni.isBlank()) {
            dni = getLoggedUserDni(); // 🔥 crea este método o vinculalo a tu SecurityContext
        }

        System.out.println("📥 Google OAuth Callback:");
        System.out.println("CODE = " + code);
        System.out.println("STATE (dni) = " + dni);

        // Intercambio del code por tokens
        googleOAuthService.exchangeCalendarCodeForTokens(code, dni);

        // Redirección al frontend
        response.sendRedirect("http://localhost:5173/google/success");
    }
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {

        String dni = getLoggedUserDni();

        var user = userRepository.findByDni(dni)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("linked", user.isGoogleLinked());
        response.put("googleEmail", user.getGoogleEmail());
        response.put("googleId", user.getGoogleId());

        return ResponseEntity.ok(response);
    }





}

