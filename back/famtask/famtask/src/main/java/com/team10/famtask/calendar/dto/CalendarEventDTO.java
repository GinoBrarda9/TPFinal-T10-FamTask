package com.team10.famtask.calendar.dto;

import java.time.LocalDateTime;

public record CalendarEventDTO(
        Long id,
        String title,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        String color,
        boolean familyEvent,
        String assignedTo
) {}