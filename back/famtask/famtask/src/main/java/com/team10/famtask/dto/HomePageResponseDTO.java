package com.team10.famtask.dto;

import com.team10.famtask.dto.family.FamilyMemberDTO;
import com.team10.famtask.event.entity.Event;
import java.util.List;

public record HomePageResponseDTO(
        Long familyId,
        String familyName,
        List<FamilyMemberDTO> members,
        List<Event> upcomingEvents
) {}
