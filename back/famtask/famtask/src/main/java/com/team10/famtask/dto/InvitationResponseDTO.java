package com.team10.famtask.dto;

import lombok.Data;

@Data
public class InvitationResponseDTO {
    private Long id;
    private String familyName;
    private String invitedUserName;
    private String invitedUserEmail;
    private String role;
    private String status;
}
