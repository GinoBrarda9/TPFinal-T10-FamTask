package com.team10.famtask.reports.finance.dto;

import java.util.List;
import java.util.Map;

public record FinanceReportDTO(
        Double totalIncome,
        Double totalExpenses,
        Double balance,
        List<MonthlyBalanceDTO> monthlyTrend,
        Map<String, Double> expensesByCategory,
        Map<String, Double> expensesByMember
) {}
