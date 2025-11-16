package com.team10.famtask.google.controller;

import com.team10.famtask.google.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final GoogleOAuthService googleOAuthService;

    @GetMapping("/auth/url")
    public String getAuthUrl() {
        return googleOAuthService.getGoogleAuthorizationUrl();
    }

    @GetMapping("/callback")
    public String handleCallback(@RequestParam("code") String code) {
        var response = googleOAuthService.handleGoogleCallback(code);
        return "✅ Google vinculado correctamente. Ya podés usar Calendar.";
    }
}