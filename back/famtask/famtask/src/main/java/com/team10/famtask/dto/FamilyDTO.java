package com.team10.famtask.dto;

import java.util.List;

public record FamilyDTO(
        Long id,
        String name,
        List<FamilyMemberDTO> members)
{
}