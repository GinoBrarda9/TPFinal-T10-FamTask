package com.team10.famtask.calendar.service;


import com.team10.famtask.calendar.dto.CalendarEventDTO;
import com.team10.famtask.calendar.mapper.CalendarEventMapper;
import com.team10.famtask.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarViewService {

    private final EventRepository eventRepository;
    private final CalendarEventMapper mapper;

    public List<CalendarEventDTO> getDayView(String dni, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        return eventRepository
                .findAllUpcomingByUserOrFamilyBetween(dni, start, end)
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    public List<CalendarEventDTO> getWeekView(String dni, LocalDate date) {
        LocalDate monday = date.with(DayOfWeek.MONDAY);
        LocalDateTime start = monday.atStartOfDay();
        LocalDateTime end = monday.plusDays(7).atStartOfDay();
        return eventRepository
                .findAllUpcomingByUserOrFamilyBetween(dni, start, end)
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    public List<CalendarEventDTO> getMonthView(String dni, int year, int month) {
        LocalDate first = LocalDate.of(year, month, 1);
        LocalDateTime start = first.atStartOfDay();
        LocalDateTime end = first.plusMonths(1).atStartOfDay();
        return eventRepository
                .findAllUpcomingByUserOrFamilyBetween(dni, start, end)
                .stream()
                .map(mapper::toDTO)
                .toList();
    }
}
