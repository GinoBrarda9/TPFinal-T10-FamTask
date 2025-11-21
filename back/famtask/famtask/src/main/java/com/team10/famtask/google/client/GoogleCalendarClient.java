package com.team10.famtask.google.client;

import com.google.api.client.auth.oauth2.TokenResponseException;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.google.config.GoogleCredentialsConfig;
import com.team10.famtask.repository.family.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleCalendarClient {

    private static final String APPLICATION_NAME = "FamTask App";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private final GoogleCredentialsConfig googleConfig;
    private final UserRepository userRepository;

    public Calendar serviceForUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("USER_NULL");
        }

        if (user.getGoogleRefreshToken() == null) {
            throw new IllegalStateException("NO_REFRESH_TOKEN");
        }

        try {
            var transport = GoogleNetHttpTransport.newTrustedTransport();

            // ===============================
            // ✅ USAMOS googleConfig AQUÍ
            // ===============================
            GoogleCredential credential = new GoogleCredential.Builder()
                    .setTransport(transport)
                    .setJsonFactory(JSON_FACTORY)
                    .setClientSecrets(
                            googleConfig.getClientId(),
                            googleConfig.getClientSecret()
                    )
                    .build()
                    .setAccessToken(user.getGoogleAccessToken())
                    .setRefreshToken(user.getGoogleRefreshToken());

            // ===============================
            // 🔄 REFRESH TOKEN
            // ===============================
            try {
                boolean refreshed = credential.refreshToken();

                if (refreshed) {
                    log.info("🔄 Token de acceso refrescado para {}", user.getEmail());

                    user.setGoogleAccessToken(credential.getAccessToken());
                    user.setGoogleTokenUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);

                } else {
                    log.warn("⚠️ Google no devolvió un access_token nuevo para {}", user.getEmail());
                }

            } catch (TokenResponseException tex) {

                String error = tex.getDetails() != null ? tex.getDetails().getError() : null;

                if ("invalid_grant".equals(error)) {

                    log.warn("⛔ Refresh token INVALIDO/REVOCADO para {}. Desvinculando.", user.getEmail());

                    user.setGoogleLinked(false);
                    user.setGoogleAccessToken(null);
                    user.setGoogleRefreshToken(null);
                    user.setGoogleTokenUpdatedAt(null);
                    userRepository.save(user);

                    // enviamos un código que el controller pueda interpretar
                    throw new IllegalStateException("GOOGLE_REAUTH_REQUIRED");
                }

                throw tex;
            }

            // ===============================
            // 📅 CONSTRUIR CLIENTE CALENDAR
            // ===============================
            return new Calendar.Builder(transport, JSON_FACTORY, credential)
                    .setApplicationName(APPLICATION_NAME)
                    .build();

        } catch (IllegalStateException ex) {
            if ("GOOGLE_REAUTH_REQUIRED".equals(ex.getMessage())) {
                throw ex; // dejarlo pasar intacto
            }
            throw new RuntimeException(ex.getMessage(), ex);

        } catch (Exception ex) {
            log.error("❌ Error inicializando Google Calendar Client", ex);
            throw new RuntimeException("GOOGLE_CLIENT_ERROR", ex);
        }
    }
}
