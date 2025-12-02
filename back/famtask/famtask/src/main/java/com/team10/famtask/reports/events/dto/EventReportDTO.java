package com.team10.famtask.reports.events.dto;

import java.util.List;

public record EventReportDTO(
        long totalEvents,
        long finishedEvents,
        long pendingEvents,
        long overdueEvents,
        List<EventTypeSummaryDTO> eventsByType,
        List<EventMemberSummaryDTO> eventsByMember,
        List<EventMonthlyTrendDTO> monthlyTrend,
        List<UpcomingEventDTO> upcomingEvents
) {}