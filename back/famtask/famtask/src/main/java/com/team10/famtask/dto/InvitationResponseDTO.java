package com.team10.famtask.dto;

import java.time.LocalDateTime;

public record InvitationResponseDTO(
        Long id,
        String familyName,
        String invitedUserName,
        String invitedUserEmail,
        String role,
        String status,
        LocalDateTime createdAt
) {}
