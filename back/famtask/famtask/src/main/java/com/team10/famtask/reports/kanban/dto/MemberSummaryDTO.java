package com.team10.famtask.reports.kanban.dto;


public record MemberSummaryDTO(
        String dni,
        String name,
        long totalAssigned,
        long completed,
        long overdue,
        long pending
) {}