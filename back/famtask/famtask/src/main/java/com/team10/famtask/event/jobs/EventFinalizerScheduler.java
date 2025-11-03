package com.team10.famtask.event.jobs;

import com.team10.famtask.event.entity.Event;
import com.team10.famtask.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventFinalizerScheduler {

    private final EventRepository eventRepository;

    @Scheduled(cron = "0 0 * * * *", zone = "America/Argentina/Cordoba")
    public void finalizePastEvents() {

        LocalDateTime now = LocalDateTime.now(ZoneId.of("America/Argentina/Cordoba"));

        List<Event> ended = eventRepository.findByEndTimeBeforeAndFinishedFalse(now);

        for (Event e : ended) {
            e.setFinished(true);
            eventRepository.save(e);
        }
    }

    @Scheduled(cron = "0 */15 * * * *", zone = "America/Argentina/Cordoba")
    public void autoFinishOldEvents() {
        LocalDateTime now = LocalDateTime.now();
        List<Event> pastEvents = eventRepository.findByEndTimeBeforeAndFinishedFalse(now);

        pastEvents.forEach(ev -> ev.setFinished(true));

        eventRepository.saveAll(pastEvents);
    }

}
