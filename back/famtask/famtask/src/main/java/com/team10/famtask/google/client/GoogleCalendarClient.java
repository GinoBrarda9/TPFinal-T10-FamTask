package com.team10.famtask.google.client;

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
     * 🔹 Obtiene el servicio de Google Calendar autenticado para un usuario
     */
    public Calendar serviceForUser(User user) {
        try {
            if (user == null) {
                throw new IllegalArgumentException("❌ Usuario no puede ser null al inicializar Calendar client");
            }

            if (user.getGoogleRefreshToken() == null) {
                throw new IllegalStateException("⚠️ El usuario no tiene refresh token almacenado");
            }

            // 🔹 Cargar las credenciales de cliente desde credentials.json
            InputStream in = getClass().getResourceAsStream("/credentials.json");
            if (in == null) {
                throw new RuntimeException("❌ No se encontró credentials.json en resources");
            }

            GoogleClientSecrets clientSecrets =
                    GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));

            var httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            // 🔹 Crear la credencial del usuario con su access/refresh token
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

            // 🔹 Refrescar token si está vencido o a punto de expirar
            if (credential.getExpiresInSeconds() == null || credential.getExpiresInSeconds() <= 60) {
                boolean refreshed = credential.refreshToken();
                if (refreshed) {
                    log.info("🔄 Token de acceso de Google refrescado correctamente para {}", user.getEmail());
                    user.setGoogleAccessToken(credential.getAccessToken());
                    user.setGoogleTokenUpdatedAt(LocalDateTime.now());
                    userRepository.save(user); // 💾 persistimos el nuevo token
                } else {
                    log.warn("⚠️ No se pudo refrescar el token de acceso para {}", user.getEmail());
                }
            }

            // 🔹 Crear el cliente de Calendar autenticado
            return new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                    .setApplicationName(APPLICATION_NAME)
                    .build();

        } catch (Exception e) {
            log.error("❌ Error inicializando Google Calendar client para usuario", e);
            throw new RuntimeException("Error inicializando Google Calendar client", e);
        }
    }
}
