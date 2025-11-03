package com.team10.famtask.calendar.mapper;

import com.team10.famtask.calendar.dto.CalendarEventDTO;
import com.team10.famtask.event.entity.Event;
import org.springframework.stereotype.Component;

@Component
public class CalendarEventMapper {

    public CalendarEventDTO toDTO(Event e) {
        boolean isFamilyEvent = e.getFamily() != null;

        String assignedName = null;
        if (e.getAssignedTo() != null &&
                e.getAssignedTo().getUser() != null) {
            assignedName = e.getAssignedTo().getUser().getName();
        }

        return new CalendarEventDTO(
                e.getId(),
                e.getTitle(),
                e.getStartTime(),
                e.getEndTime(),
                e.getLocation(),
                e.getColor(),
                isFamilyEvent,
                assignedName
        );
    }
}
