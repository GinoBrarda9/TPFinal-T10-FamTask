package com.team10.famtask.reports.events.dto;

public record EventMonthlyTrendDTO(
        String month,
        long created,
        long finished
) {}