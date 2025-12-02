package com.team10.famtask.reports.kanban.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public record ColumnSummaryDTO(
        Long columnId,
        String columnName,
        long totalCards,
        long completed,
        long pending,
        long nearDue,
        long overdue
) {}