package com.team10.famtask.reports.events.dto;

import java.time.LocalDateTime;

public record UpcomingEventDTO(
        Long id,
        String title,
        LocalDateTime start,
        String location,
        String createdBy
) {}