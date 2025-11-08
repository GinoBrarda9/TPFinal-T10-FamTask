package com.team10.famtask.whatsapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${whatsapp.phone-id}")
    private String phoneId;

    @Value("${whatsapp.token}")
    private String token;

    public void sendText(String e164Phone, String message) {
        String url = "https://graph.facebook.com/v20.0/" + phoneId + "/messages";

        Map<String, Object> body = Map.of(
                "messaging_product", "whatsapp",
                "to", e164Phone,
                "type", "text",
                "text", Map.of(
                        "preview_url", false,
                        "body", message
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            System.out.println("📤 Enviando WhatsApp a: " + e164Phone);
            System.out.println("📄 Payload: " + body);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            System.out.println("✅ WhatsApp API status: " + response.getStatusCode());
            System.out.println("✅ WhatsApp API respuesta: " + response.getBody());

        } catch (Exception ex) {
            System.err.println("❌ Error enviando WhatsApp: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
    public void sendTemplate(String e164Phone, String titulo, String hora, String lugar) {
        String url = "https://graph.facebook.com/v20.0/" + phoneId + "/messages";

        Map<String, Object> body = Map.of(
                "messaging_product", "whatsapp",
                "to", e164Phone,
                "type", "template",
                "template", Map.of(
                        "name", "event_reminder",
                        "language", Map.of("code", "es_AR"),
                        "components", List.of(
                                Map.of(
                                        "type", "body",
                                        "parameters", List.of(
                                                Map.of("type", "text", "text", titulo),
                                                Map.of("type", "text", "text", hora),
                                                Map.of("type", "text", "text", lugar)
                                        )
                                )
                        )
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            System.out.println("✅ Template WA status: " + response.getStatusCode());
            System.out.println("✅ Template WA response: " + response.getBody());
        } catch (Exception ex) {
            System.err.println("❌ Error enviando plantilla WhatsApp: " + ex.getMessage());
        }
    }

}
