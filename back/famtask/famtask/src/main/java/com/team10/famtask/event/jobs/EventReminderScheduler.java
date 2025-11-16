package com.team10.famtask.event.jobs;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.event.entity.Event;
import com.team10.famtask.event.repository.EventRepository;
import com.team10.famtask.repository.profile.ContactInfoRepository;
import com.team10.famtask.whatsapp.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventReminderScheduler {

    private final EventRepository eventRepository;
    private final ContactInfoRepository contactInfoRepository;
    private final WhatsAppService whatsappService;

    @Scheduled(cron = "0 */1 * * * *", zone = "America/Argentina/Cordoba")
    public void sendDayBeforeReminders() {

        ZoneId zone = ZoneId.of("America/Argentina/Cordoba");
        LocalDate today = LocalDate.now(zone);

        List<Event> events = eventRepository.findAll();

        for (Event ev : events) {

            // ya enviado
            if (ev.isReminderDayBeforeSent()) continue;
            if (ev.getStartTime() == null) continue;

            // fecha del evento
            LocalDate eventDate = ev.getStartTime().toLocalDate();

            // ✅ condición flexible: evento es mañana
            boolean isTomorrow = eventDate.equals(today.plusDays(1));

            // ✅ evitar enviar si ya pasó
            boolean isFuture = ev.getStartTime().isAfter(LocalDateTime.now(zone));

            if (isTomorrow && isFuture) {
                boolean sent = notifyTargets(ev, true);
                if (sent) {
                    ev.setReminderDayBeforeSent(true);
                    eventRepository.save(ev);
                }
            }
        }
    }


    @Scheduled(cron = "0 */1 * * * *", zone = "America/Argentina/Cordoba")
    public void sendHourBeforeReminders() {

        ZoneId zone = ZoneId.of("America/Argentina/Cordoba");
        LocalDateTime now = LocalDateTime.now(zone);

        // Obtener todos los eventos (no filtramos por repositorio porque puede perderse)
        List<Event> events = eventRepository.findAll();

        for (Event ev : events) {

            if (ev.isReminderHourBeforeSent()) continue;
            if (ev.getStartTime() == null) continue;

            long minutesLeft = Duration.between(now, ev.getStartTime()).toMinutes();

            // ✅ Si faltan entre 0 y 60 minutos → mandar
            if (minutesLeft <= 60 && minutesLeft >= 0) {
                boolean sent = notifyTargets(ev, false);
                if (sent) {
                    ev.setReminderHourBeforeSent(true);
                    eventRepository.save(ev);
                }
            }
        }
    }


    private boolean notifyTargets(Event ev, boolean dayBefore) {
        boolean anySent = false;
        if (ev.getFamily() != null && ev.getFamily().getMembers() != null) {
            for (var m : ev.getFamily().getMembers()) {
                var user = m.getUser();
                if (user != null && sendReminder(user.getDni(), ev, dayBefore)) anySent = true;
            }
        } else if (ev.getAssignedTo() != null && ev.getAssignedTo().getUser() != null) {
            if (sendReminder(ev.getAssignedTo().getUser().getDni(), ev, dayBefore)) anySent = true;
        }
        return anySent;
    }

    private boolean sendReminder(String dni, Event ev, boolean dayBefore) {
        var phoneOpt = contactInfoRepository.findByUser_Dni(dni).map(ci -> ci.getPhone());
        if (phoneOpt.isEmpty() || phoneOpt.get().isBlank()) return false;

        String to = "+" + phoneOpt.get().replaceAll("\\D", "");
/*        whatsappService.sendTemplate(
                to,
                ev.getTitle(),
                ev.getStartTime().toLocalTime().toString(),
                safe(ev.getLocation())
        );*/
        String message = "Hola! Este es un recordatorio de tu evento programado. \n" +
                "El evento " + ev.getTitle() + " comienza a las " + ev.getStartTime() +" hs en " + ev.getLocation() + ".\n Gracias por usar nuestra app.";
        whatsappService.sendText(to, message);
        return true;
    }

    private String safe(String s) { return s == null ? "" : s; }
}
