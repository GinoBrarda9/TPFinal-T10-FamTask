package com.team10.famtask.whatsapp.service;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Dotenv dotenv;

    /**
     * ✅ Enviar mensaje de texto normal
     */
    public void sendText(String e164Phone, String message) {

        String token = dotenv.get("WHATSAPP_TOKEN");
        String phoneId = dotenv.get("WHATSAPP_PHONE_ID");

        if (token == null || phoneId == null) {
            System.err.println("❌ ERROR: Variables WHATSAPP_TOKEN o WHATSAPP_PHONE_ID no configuradas en .env");
            return;
        }

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

    /**
     * ✅ Enviar mensaje usando plantilla aprobada por WhatsApp
     */
    public void sendTemplate(String e164Phone, String titulo, String hora, String lugar) {

        String token = dotenv.get("WHATSAPP_TOKEN");
        String phoneId = dotenv.get("WHATSAPP_PHONE_ID");

        System.out.println("-------- ✅ Enviando plantilla --------");

        if (token == null || phoneId == null) {
            System.err.println("❌ ERROR: Variables WHATSAPP_TOKEN o WHATSAPP_PHONE_ID no configuradas en .env");
            return;
        }

        String url = "https://graph.facebook.com/v20.0/" + phoneId + "/messages";

        Map<String, Object> body = Map.of(
                "messaging_product", "whatsapp",
                "to", e164Phone,
                "type", "template",
                "template", Map.of(
                        "name", "event_reminder_v2",              // nombre exacto de la plantilla aprobada
                        "language", Map.of("code", "es_AR"),   // idioma configurado en la plantilla
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
            System.out.println("📤 Enviando plantilla WA a: " + e164Phone);
            System.out.println("📄 Payload: " + body);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            System.out.println("✅ Template WA status: " + response.getStatusCode());
            System.out.println("✅ Template WA respuesta: " + response.getBody());

        } catch (Exception ex) {
            System.err.println("❌ Error enviando plantilla WhatsApp: " + ex.getMessage());
            ex.printStackTrace();
        }
    }

    public void sendCardReminder(String e164Phone, String title, String type) {

        String message = switch (type) {
            case "DAY_BEFORE" ->
                    "📆 *Recordatorio de tarea*\n " +
                            "Falta *1 día* para: *" + title + "*";
            case "HOUR_BEFORE" ->
                    "⏰ *Recordatorio de tarea*\n " +
                            "Falta *1 hora* para: *" + title + "*";
            case "EXPIRED" ->
                    "❗ *Tarea vencida*\n" +
                            "La tarea *" + title + "* ya está atrasada.";
            default ->
                    "🔔 Recordatorio: *" + title + "*";
        };

        sendText(e164Phone, message);
    }

}
