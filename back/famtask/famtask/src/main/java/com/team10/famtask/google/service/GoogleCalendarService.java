package com.team10.famtask.google.service;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.model.EventDateTime;
import com.team10.famtask.event.entity.Event;
import com.team10.famtask.google.client.GoogleCalendarClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarService {

    private final GoogleCalendarClient googleClient;

    public void syncEvent(Event ev) {
        try {
            var service = googleClient.service();

            var gEvent = new com.google.api.services.calendar.model.Event()
                    .setSummary(ev.getTitle())
                    .setDescription(ev.getDescription())
                    .setLocation(ev.getLocation());

            if (ev.getStartTime() != null) {
                gEvent.setStart(new EventDateTime().setDateTime(
                        new DateTime(Date.from(ev.getStartTime().atZone(ZoneId.systemDefault()).toInstant()))
                ).setTimeZone("America/Argentina/Cordoba"));
            }

            if (ev.getEndTime() != null) {
                gEvent.setEnd(new EventDateTime().setDateTime(
                        new DateTime(Date.from(ev.getEndTime().atZone(ZoneId.systemDefault()).toInstant()))
                ).setTimeZone("America/Argentina/Cordoba"));
            }

            var created = service.events().insert("primary", gEvent).execute();
            log.info("✅ Evento creado en Google Calendar ID={}", created.getId());

            ev.setGoogleEventId(created.getId());

        } catch (Exception ex) {
            log.error("❌ Error sincronizando Google Calendar", ex);
        }
    }

    public void updateEvent(Event ev) {
        try {
            if (ev.getGoogleEventId() == null) {
                syncEvent(ev);
                return;
            }

            var service = googleClient.service();
            var gEvent = service.events().get("primary", ev.getGoogleEventId()).execute();

            // ✅ Update text fields
            gEvent.setSummary(ev.getTitle())
                    .setDescription(ev.getDescription())
                    .setLocation(ev.getLocation());

            // ✅ Update time if exists
            if (ev.getStartTime() != null && ev.getEndTime() != null) {
                var zone = ZoneId.of("America/Argentina/Cordoba");

                var start = new DateTime(ev.getStartTime().atZone(zone).toInstant().toEpochMilli());
                var end   = new DateTime(ev.getEndTime().atZone(zone).toInstant().toEpochMilli());

                gEvent.setStart(new EventDateTime().setDateTime(start).setTimeZone(zone.toString()));
                gEvent.setEnd(new EventDateTime().setDateTime(end).setTimeZone(zone.toString()));
            }

            service.events().update("primary", ev.getGoogleEventId(), gEvent).execute();

            log.info("✅ Evento actualizado en Google Calendar {}", ev.getGoogleEventId());

        } catch (Exception ex) {
            log.error("❌ Error actualizando Google Calendar", ex);
        }
    }


    public void deleteEvent(Event ev) {
        try {
            if (ev.getGoogleEventId() == null) return;

            var service = googleClient.service();
            service.events().delete("primary", ev.getGoogleEventId()).execute();
            log.info("🗑 Evento eliminado {}", ev.getGoogleEventId());

            ev.setGoogleEventId(null);

        } catch (Exception ex) {
            log.error("❌ Error eliminando evento", ex);
        }
    }
}
