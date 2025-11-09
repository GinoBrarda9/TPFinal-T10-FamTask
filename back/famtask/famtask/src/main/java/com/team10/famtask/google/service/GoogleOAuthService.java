package com.team10.famtask.google.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.google.dto.GoogleLoginResponse;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final Dotenv dotenv;

    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    public String getGoogleAuthorizationUrl() {
        try {
            var httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            var flow = new GoogleAuthorizationCodeFlow.Builder(
                    httpTransport,
                    JSON_FACTORY,
                    dotenv.get("GOOGLE_CLIENT_ID"),
                    dotenv.get("GOOGLE_CLIENT_SECRET"),
                    Collections.singletonList("openid email profile https://www.googleapis.com/auth/calendar"))
                    .setAccessType("offline")
                    .build();

            return flow.newAuthorizationUrl()
                    .setRedirectUri(dotenv.get("GOOGLE_REDIRECT_URI"))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Error creando URL de autorización Google", e);
        }
    }

    public GoogleLoginResponse handleGoogleCallback(String code) {
        try {
            var httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            var tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    httpTransport,
                    JSON_FACTORY,
                    dotenv.get("GOOGLE_CLIENT_ID"),
                    dotenv.get("GOOGLE_CLIENT_SECRET"),
                    code,
                    dotenv.get("GOOGLE_REDIRECT_URI"))
                    .execute();

            var payload = tokenResponse.parseIdToken().getPayload();

            String googleId = payload.getSubject();
            String email = (String) payload.get("email");
            String name = (String) payload.get("name");

            User user = userRepository.findByGoogleId(googleId)
                    .orElseGet(() -> userRepository.findByGoogleEmail(email)
                            .orElseGet(() -> createNewGoogleUser(googleId, email, name)));

            if (tokenResponse.getRefreshToken() != null) {
                user.setGoogleRefreshToken(tokenResponse.getRefreshToken());
                user.setGoogleLinked(true);
                user.setGoogleTokenUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            }

            String jwt = jwtService.generateToken(
                    user.getEmail(), user.getDni(), user.getRole(), user.getName()
            );

            return new GoogleLoginResponse(jwt, user.getName(), user.getEmail(), user.getRole());

        } catch (Exception e) {
            throw new RuntimeException("Error manejando callback de Google", e);
        }
    }

    private User createNewGoogleUser(String googleId, String email, String name) {
        User newUser = User.builder()
                .dni(googleId.substring(0, 15))
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
