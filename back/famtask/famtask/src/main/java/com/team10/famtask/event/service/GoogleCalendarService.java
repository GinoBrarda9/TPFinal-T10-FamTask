package com.team10.famtask.event.service;

import com.team10.famtask.event.entity.Event;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class GoogleCalendarService {

    // =========================================================
    // ✅ Crear evento en Google Calendar (simulado)
    // =========================================================
    public void syncEvent(Event event) {
        log.info("[GoogleCalendarService] Creando evento en Google Calendar: {}", event.getTitle());

        // En implementación real: llamada a Calendar.Events.insert(...)
        event.setGoogleEventId("simulated-google-id-" + event.getId());
    }

    // =========================================================
    // ✅ Actualizar evento en Google Calendar (simulado)
    // =========================================================
    public void updateEvent(Event event) {
        if (event.getGoogleEventId() == null) {
            log.warn("[GoogleCalendarService] El evento '{}' aún no existe en Google Calendar. Llamando a syncEvent...", event.getTitle());
            syncEvent(event);
            return;
        }

        log.info("[GoogleCalendarService] Actualizando evento en Google Calendar: {} - ID: {}",
                event.getTitle(), event.getGoogleEventId());

        // En implementación real: Calendar.Events.update(...)
    }

    // =========================================================
    // ✅ Eliminar evento en Google Calendar (simulado)
    // =========================================================
    public void deleteEvent(Event event) {
        if (event.getGoogleEventId() == null) {
            log.warn("[GoogleCalendarService] No se puede eliminar: el evento '{}' nunca fue sincronizado con Google Calendar.", event.getTitle());
            return;
        }

        log.info("[GoogleCalendarService] Eliminando evento de Google Calendar: {} - ID: {}",
                event.getTitle(), event.getGoogleEventId());

        // En implementación real: Calendar.Events.delete(...)

        event.setGoogleEventId(null); // Simulación de eliminación
    }
}
