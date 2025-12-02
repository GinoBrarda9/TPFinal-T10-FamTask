package com.team10.famtask.reports.events;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.event.entity.Event;
import com.team10.famtask.event.repository.EventRepository;
import com.team10.famtask.reports.events.dto.*;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.service.security.SecurityService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventReportService {

    private final EventRepository eventRepository;
    private final FamilyRepository familyRepository;
    private final SecurityService securityService;
    private final FamilyMemberRepository familyMemberRepository;

    // -------------------------------------------
    // GET FAMILY
    // -------------------------------------------
    private Family getLoggedFamily() {
        String dni = securityService.getCurrentUser().getDni();

        return familyRepository.findByMemberFetchAll(dni)
                .orElseThrow(() -> new RuntimeException("No pertenecés a ninguna familia"));
    }

    // -------------------------------------------
    // MAIN REPORT
    // -------------------------------------------
    public EventReportDTO generateEventReport(LocalDate from, LocalDate to) {

        String dni = securityService.getCurrentUser().getDni();

        // Puede no tener familia (aunque en tu app siempre tiene)
        Family family = familyRepository.findByMemberFetchAll(dni).orElse(null);

        if (from == null) from = LocalDate.now().withDayOfYear(1);
        if (to == null) to = LocalDate.now();

        LocalDate finalFrom = from;
        LocalDate finalTo   = to;

        // 1) Eventos familiares
        List<Event> familyEvents = family != null
                ? eventRepository.findByFamily(family)
                : List.of();

        // 2) Eventos personales asignados al usuario
        List<Event> personalEvents = eventRepository.findByAssignedTo_User_Dni(dni);

        // Unión evitando repetidos
        List<Event> events = new ArrayList<>();
        events.addAll(familyEvents);
        events.addAll(personalEvents);

        events = events.stream().distinct().toList();

        // Filtrar por rango de fechas
        events = events.stream()
                .filter(e -> e.getStartTime() != null)
                .filter(e -> {
                    LocalDate date = e.getStartTime().toLocalDate();
                    return !date.isBefore(finalFrom) && !date.isAfter(finalTo);
                })
                .toList();

        long total      = events.size();
        long finished   = events.stream().filter(Event::isFinished).count();
        long pending    = total - finished;
        long overdue    = events.stream()
                .filter(e -> !e.isFinished())
                .filter(e -> e.getEndTime() != null && e.getEndTime().isBefore(LocalDateTime.now()))
                .count();

        // Agrupar por tipo (location por ahora)
        Map<String, Long> byType = events.stream()
                .collect(Collectors.groupingBy(
                        e -> (e.getLocation() != null && !e.getLocation().isBlank())
                                ? e.getLocation()
                                : "Sin ubicación",
                        Collectors.counting()
                ));

        List<EventTypeSummaryDTO> eventsByType = byType.entrySet().stream()
                .map(e -> new EventTypeSummaryDTO(e.getKey(), e.getValue()))
                .toList();

        // Agrupar por miembro
        Map<String, Long> byMember = new HashMap<>();

        for (Event e : events) {

            String memberName = "Sin asignar";

            if (e.getAssignedTo() != null && e.getAssignedTo().getUser() != null) {
                memberName = e.getAssignedTo().getUser().getName();
            }

            byMember.put(memberName, byMember.getOrDefault(memberName, 0L) + 1);
        }

        List<EventMemberSummaryDTO> eventsByMember = byMember.entrySet().stream()
                .map(e -> new EventMemberSummaryDTO(e.getKey(), e.getValue()))
                .toList();

        // Eventos próximos (7 días)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime week = now.plusDays(7);

        List<UpcomingEventDTO> upcoming = events.stream()
                .filter(e -> e.getStartTime() != null)
                .filter(e -> e.getStartTime().isAfter(now) && e.getStartTime().isBefore(week))
                .sorted(Comparator.comparing(Event::getStartTime))
                .map(e -> new UpcomingEventDTO(
                        e.getId(),
                        e.getTitle(),
                        e.getStartTime(),
                        e.getLocation(),
                        e.getAssignedTo() != null && e.getAssignedTo().getUser() != null
                                ? e.getAssignedTo().getUser().getName()
                                : "Sin asignar"
                ))
                .toList();

        // Tendencia mensual
        List<EventMonthlyTrendDTO> monthlyTrend = buildMonthlyTrend(events, from, to);

        return new EventReportDTO(
                total,
                finished,
                pending,
                overdue,
                eventsByType,
                eventsByMember,
                monthlyTrend,
                upcoming
        );
    }



    private List<EventMonthlyTrendDTO> buildMonthlyTrend(List<Event> events, LocalDate from, LocalDate to) {

        List<EventMonthlyTrendDTO> list = new ArrayList<>();

        YearMonth start = YearMonth.from(from);
        YearMonth end   = YearMonth.from(to);

        YearMonth current = start;

        while (!current.isAfter(end)) {

            int y = current.getYear();
            int m = current.getMonthValue();

            long created = events.stream()
                    .filter(e -> e.getStartTime() != null)
                    .filter(e -> e.getStartTime().getYear() == y && e.getStartTime().getMonthValue() == m)
                    .count();

            long finished = events.stream()
                    .filter(Event::isFinished)
                    .filter(e -> e.getEndTime() != null)
                    .filter(e -> e.getEndTime().getYear() == y && e.getEndTime().getMonthValue() == m)
                    .count();

            list.add(
                    new EventMonthlyTrendDTO(
                            current.getMonth().getDisplayName(TextStyle.FULL, new Locale("es")),
                            created,
                            finished
                    )
            );

            current = current.plusMonths(1);
        }

        return list;
    }
}