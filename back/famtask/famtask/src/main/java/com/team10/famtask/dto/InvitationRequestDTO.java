package com.team10.famtask.dto;

public record InvitationRequestDTO(
        Long familyId,
        String invitedUserEmail,
        String role
){
}