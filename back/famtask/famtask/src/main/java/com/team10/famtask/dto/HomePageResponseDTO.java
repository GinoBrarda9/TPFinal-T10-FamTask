package com.team10.famtask.dto;

import com.team10.famtask.event.entity.Event;
import java.util.List;

public record HomePageResponseDTO(
        String familyName,
        List<FamilyMemberDTO> members,
        List<Event> upcomingEvents
) {}
