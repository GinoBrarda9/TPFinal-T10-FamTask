package com.team10.famtask.reports.events;

import com.team10.famtask.reports.events.dto.EventReportDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/events")
@RequiredArgsConstructor
public class EventReportController {

    private final EventReportService eventReportService;

    @GetMapping
    public EventReportDTO getEventReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        LocalDate fromDate = from != null ? LocalDate.parse(from) : null;
        LocalDate toDate   = to   != null ? LocalDate.parse(to)   : null;

        return eventReportService.generateEventReport(fromDate, toDate);
    }
}
