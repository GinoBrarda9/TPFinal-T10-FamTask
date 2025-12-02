package com.team10.famtask.reports.kanban.dto;

public record MonthlyKanbanTrendDTO(
        String month,   // ejemplo: "enero"
        long createdCards,
        long completedCards,
        long netFlow     // created - completed
) {}