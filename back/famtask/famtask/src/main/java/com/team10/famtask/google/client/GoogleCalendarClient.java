package com.team10.famtask.google.client;

import com.google.api.client.auth.oauth2.TokenResponseException;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleCalendarClient {

    private static final String APPLICATION_NAME = "FamTask App";
    private static final GsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    private final UserRepository userRepository;

    /**
     * Obtiene el servicio de Google Calendar autenticado para un usuario.
     * - Usa el client_id / client_secret de /resources/credentials.json
     * - Intenta refrescar el access_token con el refresh_token guardado
     * - Si el refresh_token está revocado/expirado (invalid_grant) -> desvincula Google del usuario
     */
    public Calendar serviceForUser(User user) {
        try {
            if (user == null) {
                throw new IllegalArgumentException("❌ Usuario no puede ser null al inicializar Calendar client");
            }

            if (user.getGoogleRefreshToken() == null) {
                throw new IllegalStateException("⚠️ El usuario no tiene refresh token almacenado");
            }

            // 1) Cargar client_id / client_secret desde credentials.json
            InputStream in = getClass().getResourceAsStream("/credentials.json");
            if (in == null) {
                throw new RuntimeException("❌ No se encontró credentials.json en resources");
            }

            GoogleClientSecrets clientSecrets =
                    GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

            var httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            // 2) Construir credencial con los tokens actuales del usuario
            GoogleCredential credential = new GoogleCredential.Builder()
                    .setTransport(httpTransport)
                    .setJsonFactory(JSON_FACTORY)
                    .setClientSecrets(
                            clientSecrets.getDetails().getClientId(),
                            clientSecrets.getDetails().getClientSecret()
                    )
                    .build()
                    .setAccessToken(user.getGoogleAccessToken())
                    .setRefreshToken(user.getGoogleRefreshToken());

            // 3) Intentar refrescar siempre el access_token
            try {
                boolean refreshed = credential.refreshToken();
                if (refreshed) {
                    log.info("🔄 Token de acceso de Google refrescado correctamente para {}", user.getEmail());
                    user.setGoogleAccessToken(credential.getAccessToken());
                    user.setGoogleTokenUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                } else {
                    log.warn("⚠️ Google no devolvió nuevo access_token para {}", user.getEmail());
                }
            } catch (TokenResponseException tre) {
                // Caso típico: invalid_grant (refresh_token revocado/expirado)
                String error = tre.getDetails() != null ? tre.getDetails().getError() : null;
                if ("invalid_grant".equals(error)) {
                    log.warn("⛔ Refresh token inválido o revocado para {}. Desvinculando Google.", user.getEmail());

                    user.setGoogleLinked(false);
                    user.setGoogleAccessToken(null);
                    user.setGoogleRefreshToken(null);
                    user.setGoogleTokenUpdatedAt(null);
                    userRepository.save(user);

                    // No tiramos otra excepción "rara": dejamos que el caller lo maneje o solo se loguee.
                    throw new IllegalStateException("GOOGLE_TOKEN_REVOKED");
                }
                throw tre;
            }

            // 4) Construir el cliente de Calendar autenticado
            return new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                    .setApplicationName(APPLICATION_NAME)
                    .build();

        } catch (Exception e) {
            log.error("❌ Error inicializando Google Calendar client para usuario", e);
            throw new RuntimeException("Error inicializando Google Calendar client", e);
        }
    }
}
