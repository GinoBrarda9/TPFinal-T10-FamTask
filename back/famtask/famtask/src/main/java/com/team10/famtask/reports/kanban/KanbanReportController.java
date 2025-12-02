package com.team10.famtask.reports.kanban;

import com.team10.famtask.reports.kanban.dto.KanbanReportDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/kanban")
@RequiredArgsConstructor
public class KanbanReportController {

    private final KanbanReportService reportService;

    @GetMapping
    public KanbanReportDTO getKanbanReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {

        LocalDate fromDate = (from != null ? LocalDate.parse(from) : null);
        LocalDate toDate   = (to   != null ? LocalDate.parse(to)   : null);

        return reportService.generateKanbanReport(fromDate, toDate);
    }
}
