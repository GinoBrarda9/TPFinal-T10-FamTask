package com.team10.famtask.reports.finance;

import com.team10.famtask.reports.finance.dto.FinanceReportDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports/finance")
@RequiredArgsConstructor
public class FinanceReportController {

    private final FinanceReportService financeReportService;

    /**
     * Endpoint principal del reporte financiero.
     *
     * Permite pasar rango por fecha:
     *   /api/reports/finance?from=2024-01-01&to=2024-12-31
     *
     * Si no se pasa 'from' ni 'to', devuelve TODO el histórico.
     */
    @GetMapping
    public FinanceReportDTO getFinanceReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {

        LocalDate fromDate = (from != null ? LocalDate.parse(from) : null);
        LocalDate toDate   = (to   != null ? LocalDate.parse(to)   : null);

        return financeReportService.generateFinanceReport(fromDate, toDate);
    }
}
