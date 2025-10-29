package com.team10.famtask.event.mapper;

import com.team10.famtask.event.dto.EventDTO;
import com.team10.famtask.event.entity.Event;

public class EventMapper {
    public static EventDTO toDTO(Event event) {
        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .location(event.getLocation())
                .color(event.getColor())
                .allDay(event.isAllDay())
                .familyId(event.getFamily() != null ? event.getFamily().getId() : null)
                .memberDni(event.getAssignedTo() != null ? event.getAssignedTo().getUser().getDni() : null)
                .googleEventId(event.getGoogleEventId())
                .build();
    }
}
