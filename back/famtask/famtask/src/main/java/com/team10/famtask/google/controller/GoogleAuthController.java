package com.team10.famtask.google.controller;

import com.team10.famtask.google.dto.GoogleLoginResponse;
import com.team10.famtask.google.service.GoogleOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final GoogleOAuthService googleOAuthService;

    @GetMapping("/auth/url")
    public String getAuthUrl() {
        return googleOAuthService.getGoogleAuthorizationUrl();
    }

    @GetMapping("/google/callback")
    public void googleCallback(
            @RequestParam("code") String code,
            HttpServletResponse response
    ) throws IOException {

        GoogleLoginResponse loginResponse = googleOAuthService.handleGoogleCallback(code);

        // Redirigir al front
        response.sendRedirect("http://localhost:5173/google/success?token=" + loginResponse.getJwtToken());
    }



}