package com.team10.famtask.dto;

public record InvitationDTO(
        Long id,
        FamilyDTO family,
        FamilyMemberDTO invitedUser,
        String role,
        String status)
{
}
