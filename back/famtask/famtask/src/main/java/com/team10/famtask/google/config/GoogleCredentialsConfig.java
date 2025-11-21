package com.team10.famtask.google.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.json.gson.GsonFactory;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.io.InputStreamReader;

@Slf4j
@Getter
@Component
public class GoogleCredentialsConfig {

    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;

    public GoogleCredentialsConfig() {
        try {
            InputStream in = getClass().getResourceAsStream("/credentials.json");
            if (in == null) {
                throw new RuntimeException("❌ No se encontró credentials.json");
            }

            GoogleClientSecrets secrets = GoogleClientSecrets.load(
                    GsonFactory.getDefaultInstance(),
                    new InputStreamReader(in)
            );

            this.clientId = secrets.getDetails().getClientId();
            this.clientSecret = secrets.getDetails().getClientSecret();
            this.redirectUri = secrets.getDetails().getRedirectUris().get(0);

            log.info("📌 Google credentials cargadas correctamente.");

        } catch (Exception e) {
            throw new RuntimeException("Error cargando Google credentials", e);
        }
    }
}
