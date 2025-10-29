package com.team10.famtask.dto;

import com.team10.famtask.entity.calendar.Event;
import java.util.List;

public record HomePageResponseDTO(
        Long familyId,
        String familyName,
        List<FamilyMemberDTO> members,
        List<Event> upcomingEvents
) {}
