package com.team10.famtask.google.service;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.model.EventDateTime;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.event.entity.Event;
import com.team10.famtask.google.client.GoogleCalendarClient;
import com.team10.famtask.repository.family.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.Date;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarService {

    private final GoogleCalendarClient googleClient;

    private static final String TIMEZONE = "America/Argentina/Cordoba";
    private final UserRepository userRepository;

    /**
     * ✅ Crear evento en Google Calendar (sincronización inicial)
     */
    public void syncEvent(Event ev) {
        try {
            // Validaciones básicas
            if (ev == null) {
                log.warn("⚠️ No se puede sincronizar un evento nulo.");
                return;
            }
            if (ev.getCreatedBy() == null) {
                log.warn("⚠️ El evento no tiene usuario creador, se omite sincronización con Google Calendar.");
                return;
            }

            var service = googleClient.serviceForUser(ev.getCreatedBy());

            var gEvent = new com.google.api.services.calendar.model.Event()
                    .setSummary(ev.getTitle())
                    .setDescription(ev.getDescription())
                    .setLocation(ev.getLocation());

            // Fechas de inicio y fin
            if (ev.getStartTime() != null) {
                gEvent.setStart(new EventDateTime().setDateTime(
                        new DateTime(Date.from(ev.getStartTime()
                                .atZone(ZoneId.of(TIMEZONE))
                                .toInstant()))
                ).setTimeZone(TIMEZONE));
            }

            if (ev.getEndTime() != null) {
                gEvent.setEnd(new EventDateTime().setDateTime(
                        new DateTime(Date.from(ev.getEndTime()
                                .atZone(ZoneId.of(TIMEZONE))
                                .toInstant()))
                ).setTimeZone(TIMEZONE));
            }

            // Insertar en el calendario principal del usuario
            var created = service.events().insert("primary", gEvent).execute();
            ev.setGoogleEventId(created.getId());

            log.info("✅ Evento creado y sincronizado con Google Calendar. ID={}", created.getId());

        } catch (IllegalStateException e) {
            if ("GOOGLE_TOKEN_REVOKED".equals(e.getMessage())) {
                log.warn("⚠️ El usuario debe volver a vincular Google (refresh token revocado). Se omite sync.");
            } else {
                log.error("❌ Error de estado al sincronizar evento con Google Calendar", e);
            }
        } catch (Exception ex) {
            log.error("❌ Error sincronizando evento con Google Calendar", ex);
        }
    }

    /**
     * ✅ Actualizar evento existente en Google Calendar
     */
    public void updateEvent(Event ev) {
        try {
            if (ev == null) {
                log.warn("⚠️ No se puede actualizar un evento nulo.");
                return;
            }

            if (ev.getCreatedBy() == null) {
                log.warn("⚠️ El evento no tiene usuario creador, no se puede actualizar en Calendar.");
                return;
            }

            var service = googleClient.serviceForUser(ev.getCreatedBy());

            // Si no tiene GoogleEventId, crearlo nuevo
            if (ev.getGoogleEventId() == null) {
                log.info("ℹ️ Evento sin ID de Google, creando uno nuevo...");
                syncEvent(ev);
                return;
            }

            // Obtener el evento existente de Google
            var gEvent = service.events().get("primary", ev.getGoogleEventId()).execute();

            // Actualizar campos básicos
            gEvent.setSummary(ev.getTitle())
                    .setDescription(ev.getDescription())
                    .setLocation(ev.getLocation());

            // Actualizar fechas
            if (ev.getStartTime() != null && ev.getEndTime() != null) {
                var zone = ZoneId.of(TIMEZONE);
                var start = new DateTime(ev.getStartTime().atZone(zone).toInstant().toEpochMilli());
                var end = new DateTime(ev.getEndTime().atZone(zone).toInstant().toEpochMilli());

                gEvent.setStart(new EventDateTime().setDateTime(start).setTimeZone(zone.toString()));
                gEvent.setEnd(new EventDateTime().setDateTime(end).setTimeZone(zone.toString()));
            }

            // Ejecutar actualización
            service.events().update("primary", ev.getGoogleEventId(), gEvent).execute();

            log.info("✅ Evento actualizado correctamente en Google Calendar (ID={})", ev.getGoogleEventId());

        } catch (Exception ex) {
            log.error("❌ Error actualizando evento en Google Calendar", ex);
        }
    }
    public Map<String, Object> getCalendarLinkStatus(String dni) {
        User user = userRepository.findByDni(dni)

                .orElseThrow();

        return Map.of(
                "linked", user.isGoogleLinked(),
                "googleEmail", user.getGoogleEmail(),
                "googleId", user.getGoogleId()
        );
    }

    /**
     * ✅ Eliminar evento de Google Calendar
     */
    public void deleteEvent(Event ev) {
        try {
            if (ev == null) {
                log.warn("⚠️ Evento nulo, no se elimina de Calendar.");
                return;
            }

            if (ev.getCreatedBy() == null) {
                log.warn("⚠️ Evento sin usuario creador, no se puede eliminar del Calendar.");
                return;
            }

            if (ev.getGoogleEventId() == null) {
                log.info("ℹ️ Evento sin GoogleEventId, no hay nada que eliminar.");
                return;
            }

            var service = googleClient.serviceForUser(ev.getCreatedBy());
            service.events().delete("primary", ev.getGoogleEventId()).execute();

            log.info("🗑 Evento eliminado de Google Calendar (ID={})", ev.getGoogleEventId());
            ev.setGoogleEventId(null);

        } catch (Exception ex) {
            log.error("❌ Error eliminando evento de Google Calendar", ex);
        }
    }
}
