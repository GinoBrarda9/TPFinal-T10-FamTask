package com.team10.famtask.calendar.controller;

import com.team10.famtask.calendar.dto.CalendarEventDTO;
import com.team10.famtask.calendar.service.CalendarViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarViewService calendarService;

    @GetMapping("/day")
    public List<CalendarEventDTO> dayView(
            @RequestParam String dni,
            @RequestParam String date) {
        return calendarService.getDayView(dni, LocalDate.parse(date));
    }

    @GetMapping("/week")
    public List<CalendarEventDTO> weekView(
            @RequestParam String dni,
            @RequestParam String date) {
        return calendarService.getWeekView(dni, LocalDate.parse(date));
    }

    @GetMapping("/month")
    public List<CalendarEventDTO> monthView(
            @RequestParam String dni,
            @RequestParam int year,
            @RequestParam int month) {
        return calendarService.getMonthView(dni, year, month);
    }
}
