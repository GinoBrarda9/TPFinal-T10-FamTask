package com.team10.famtask.reports.kanban.dto;

import java.util.List;

public record KanbanReportDTO(
        Long boardId,
        String boardName,
        long totalCards,
        long finishedCards,
        long pendingCards,
        long overdueCards,
        long nearDueCards,
        long unassignedCards,

        List<ColumnSummaryDTO> columnSummaries,
        List<MemberSummaryDTO> memberSummaries,
        List<MonthlyKanbanTrendDTO> monthlyTrend
) {}