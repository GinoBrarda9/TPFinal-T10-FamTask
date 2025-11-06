package com.team10.famtask.event.mapper;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.event.dto.EventDTO;
import com.team10.famtask.event.entity.Event;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EventMapper {

    public EventDTO toDTO(Event event) {
        if (event == null) return null;

        Family family = event.getFamily();
        FamilyMember member = event.getAssignedTo();

        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .location(event.getLocation())
                .color(event.getColor())
                .allDay(event.isAllDay())
                .familyId(family != null ? family.getId() : null)
                .memberDni(member != null && member.getUser() != null ? member.getUser().getDni() : null)
                .googleEventId(event.getGoogleEventId())
                .build();
    }

    public List<EventDTO> toDTOList(List<Event> events) {
        if (events == null) return List.of();
        return events.stream()
                // ❌ antes filtraba solo personales → lo quitamos
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
