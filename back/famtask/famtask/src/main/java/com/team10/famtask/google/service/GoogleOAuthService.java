package com.team10.famtask.google.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.google.dto.GoogleLoginResponse;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    private static final String CLIENT_SECRET_FILE = "/credentials.json";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    /**
     * ✅ Devuelve URL de login a Google
     */
    public String getGoogleAuthorizationUrl() {
        try {
            var httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            var secrets = GoogleClientSecrets.load(JSON_FACTORY,
                    new InputStreamReader(getClass().getResourceAsStream(CLIENT_SECRET_FILE)));

            var flow = new GoogleAuthorizationCodeFlow.Builder(
                    httpTransport,
                    JSON_FACTORY,
                    secrets,
                    Collections.singletonList("openid email profile https://www.googleapis.com/auth/calendar"))
                    .setAccessType("offline")
                    .build();

            return flow.newAuthorizationUrl()
                    .setRedirectUri(redirectUri)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Error creando URL de autorización Google", e);
        }
    }

    /**
     * ✅ Maneja el callback de Google (recibe el "code")
     */
    public GoogleLoginResponse handleGoogleCallback(String code) {
        try {
            var httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            var secrets = GoogleClientSecrets.load(JSON_FACTORY,
                    new InputStreamReader(getClass().getResourceAsStream(CLIENT_SECRET_FILE)));

            var tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    httpTransport,
                    JSON_FACTORY,
                    secrets.getDetails().getClientId(),
                    secrets.getDetails().getClientSecret(),
                    code,
                    redirectUri)
                    .execute();

            var idToken = tokenResponse.parseIdToken();
            var payload = idToken.getPayload();

            String googleId = payload.getSubject();
            String email = (String) payload.get("email");
            String name = (String) payload.get("name");

            User user = userRepository.findByGoogleId(googleId)
                    .orElseGet(() -> userRepository.findByGoogleEmail(email)
                            .orElseGet(() -> createNewGoogleUser(googleId, email, name)));

            // Guardamos refresh_token si viene
            if (tokenResponse.getRefreshToken() != null) {
                user.setGoogleRefreshToken(tokenResponse.getRefreshToken());
                user.setGoogleLinked(true);
                user.setGoogleTokenUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            }

            // Generamos JWT de nuestra app
            String jwt = jwtService.generateToken(user.getEmail(), user.getDni(), user.getRole(), user.getName());

            return new GoogleLoginResponse(jwt, user.getName(), user.getEmail(), user.getRole());

        } catch (Exception e) {
            throw new RuntimeException("Error manejando callback de Google", e);
        }
    }

    private User createNewGoogleUser(String googleId, String email, String name) {
        User newUser = User.builder()
                .dni(googleId.substring(0, 15)) // pseudo dni único
                .googleId(googleId)
                .googleEmail(email)
                .email(email)
                .name(name)
                .role("USER")
                .googleLinked(true)
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(newUser);
    }
}