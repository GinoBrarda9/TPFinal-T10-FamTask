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
import java.time.ZonedDateTime;
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
            if (ev == null || ev.getCreatedBy() == null) return;

            var service = googleClient.serviceForUser(ev.getCreatedBy());

            var gEvent = new com.google.api.services.calendar.model.Event()
                    .setSummary(ev.getTitle())
                    .setDescription(ev.getDescription())
                    .setLocation(ev.getLocation());

            ZoneId zone = ZoneId.of(TIMEZONE);

            // ==== FECHA INICIO ====
            if (ev.getStartTime() != null) {
                ZonedDateTime start = ev.getStartTime().atZone(zone);

                gEvent.setStart(
                        new EventDateTime()
                                .setDateTime(new DateTime(start.toInstant().toEpochMilli()))
                                .setTimeZone(TIMEZONE)
                );
            }

            // ==== FECHA FIN ====
            if (ev.getEndTime() != null) {
                ZonedDateTime end = ev.getEndTime().atZone(zone);

                gEvent.setEnd(
                        new EventDateTime()
                                .setDateTime(new DateTime(end.toInstant().toEpochMilli()))
                                .setTimeZone(TIMEZONE)
                );
            }

            var created = service.events().insert("primary", gEvent).execute();
            ev.setGoogleEventId(created.getId());

            log.info("✅ Evento sincronizado con Google Calendar. ID={}", created.getId());

        } catch (IllegalStateException e) {
            if ("GOOGLE_TOKEN_REVOKED".equals(e.getMessage())) {
                log.warn("⚠️ El usuario debe volver a vincular Google.");
            } else {
                log.error("❌ Error de estado al sincronizar Calendar", e);
            }
        } catch (Exception ex) {
            log.error("❌ Error sincronizando Calendar", ex);
        }
    }


    /**
     * ✅ Actualizar evento existente en Google Calendar
     */
    public void updateEvent(Event ev) {
        try {
            if (ev == null || ev.getCreatedBy() == null) return;

            var service = googleClient.serviceForUser(ev.getCreatedBy());

            if (ev.getGoogleEventId() == null) {
                syncEvent(ev);
                return;
            }

            var gEvent = service.events().get("primary", ev.getGoogleEventId()).execute();

            gEvent.setSummary(ev.getTitle())
                    .setDescription(ev.getDescription())
                    .setLocation(ev.getLocation());

            ZoneId zone = ZoneId.of(TIMEZONE);

            // ==== START ====
            if (ev.getStartTime() != null) {
                ZonedDateTime start = ev.getStartTime().atZone(zone);
                gEvent.setStart(
                        new EventDateTime()
                                .setDateTime(new DateTime(start.toInstant().toEpochMilli()))
                                .setTimeZone(TIMEZONE)
                );
            }

            // ==== END ====
            if (ev.getEndTime() != null) {
                ZonedDateTime end = ev.getEndTime().atZone(zone);
                gEvent.setEnd(
                        new EventDateTime()
                                .setDateTime(new DateTime(end.toInstant().toEpochMilli()))
                                .setTimeZone(TIMEZONE)
                );
            }

            service.events().update("primary", ev.getGoogleEventId(), gEvent).execute();
            log.info("✅ Evento actualizado en Google Calendar.");

        } catch (Exception ex) {
            log.error("❌ Error actualizando evento en Calendar", ex);
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
