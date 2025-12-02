package com.team10.famtask.reports.finance.dto;

public record MonthlyBalanceDTO(
        String month,   // ejemplo: "2025-02"
        Double income,
        Double expenses,
        Double balance
) {}
