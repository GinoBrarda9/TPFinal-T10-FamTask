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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

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
                    .setAccessType("offline")
                    .setApprovalPrompt("force")
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
                            .orElseGet(() -> userRepository.findByEmail(email)
                                    .orElseGet(() -> createNewGoogleUser(googleId, email, name))));

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
    public Map<String, Object> getCalendarLinkStatus(String dni) {
        User user = userRepository.findById(dni)
                .orElseThrow();

        return Map.of(
                "linked", user.isGoogleLinked(),
                "googleEmail", user.getGoogleEmail(),
                "googleId", user.getGoogleId()
        );
    }


    public String generateCalendarAuthUrl(String dni) {

        String clientId = dotenv.get("GOOGLE_CLIENT_ID");
        String redirectUri = dotenv.get("GOOGLE_REDIRECT_URI");

        String scopes =
                "openid email profile "
                        + "https://www.googleapis.com/auth/calendar "
                        + "https://www.googleapis.com/auth/calendar.events";


        String authorizationUrl =
                "https://accounts.google.com/o/oauth2/v2/auth"
                        + "?client_id=" + clientId
                        + "&redirect_uri=" + redirectUri
                        + "&response_type=code"
                        + "&scope=" + URLEncoder.encode(scopes, StandardCharsets.UTF_8)
                        + "&access_type=offline"
                        + "&prompt=consent"
                        + "&state=" + dni;

        return authorizationUrl;
    }
    public void exchangeCalendarCodeForTokens(String code, String dni) {
        try {
            var httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            var tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    httpTransport,
                    JSON_FACTORY,
                    dotenv.get("GOOGLE_CLIENT_ID"),
                    dotenv.get("GOOGLE_CLIENT_SECRET"),
                    code,
                    dotenv.get("GOOGLE_REDIRECT_URI")
            ).execute();

            String accessToken = tokenResponse.getAccessToken();

            // ================================
            // 🔥 Obtener datos del usuario real
            // ================================
            var requestFactory = httpTransport.createRequestFactory(
                    request -> request.getHeaders().setAuthorization("Bearer " + accessToken)
            );

            var userInfoRequest = requestFactory.buildGetRequest(
                    new com.google.api.client.http.GenericUrl("https://www.googleapis.com/oauth2/v2/userinfo")
            );

            var userInfoResponse = userInfoRequest.execute();
            String userInfoJson = userInfoResponse.parseAsString();

            // 🔍 DEBUG para ver qué devuelve Google
            System.out.println("🔍 accessToken = " + accessToken);
            System.out.println("🔍 userInfo JSON = " + userInfoJson);

            // Convertir JSON → Map
            var gson = new com.google.gson.Gson();
            var userInfo = gson.fromJson(userInfoJson, Map.class);

            String googleId = (String) userInfo.get("id");
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");

            // ================================
            // 🔥 Guardar en base de datos
            // ================================
            userRepository.findById(dni).ifPresent(user -> {
                user.setGoogleEmail(email);
                user.setGoogleId(googleId);
                user.setGoogleAccessToken(accessToken);

                if (tokenResponse.getRefreshToken() != null) {
                    user.setGoogleRefreshToken(tokenResponse.getRefreshToken());
                }

                user.setGoogleLinked(true);
                user.setGoogleTokenUpdatedAt(LocalDateTime.now());

                userRepository.save(user);
            });

        } catch (Exception e) {
            throw new RuntimeException("Error intercambiando código por tokens de Calendar", e);
        }
    }




}
