package com.team10.famtask.google.controller;

import com.team10.famtask.google.service.GoogleOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/google/calendar")
@RequiredArgsConstructor
public class GoogleCalendarController {

    private final GoogleOAuthService googleOAuthService;

    @GetMapping("/auth/url")
    public ResponseEntity<Map<String, String>> getCalendarAuthUrl(@RequestParam String dni) {
        String url = googleOAuthService.generateCalendarAuthUrl(dni);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/callback")
    public void handleCalendarCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String dni,
            HttpServletResponse response
    ) throws IOException {

        googleOAuthService.exchangeCalendarCodeForTokens(code, dni);

        response.sendRedirect("http://localhost:5173/google/success");
    }
}

