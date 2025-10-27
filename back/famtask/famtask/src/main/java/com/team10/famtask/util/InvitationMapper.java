package com.team10.famtask.util;

import com.team10.famtask.dto.InvitationResponseDTO;
import com.team10.famtask.dto.InvitationSimpleDTO;
import com.team10.famtask.entity.family.Invitation;

public class InvitationMapper {

    public static InvitationResponseDTO toResponseDTO(Invitation invitation) {
        return new InvitationResponseDTO(
                invitation.getId(),
                invitation.getFamily().getName(),
                invitation.getInvitedUser().getName(),
                invitation.getInvitedUser().getEmail(),
                invitation.getRole(),
                invitation.getStatus(),
                invitation.getCreatedAt()
        );
    }

    /*  public static InvitationResponseDTO toResponseDTO(Invitation invitation) {
        if (invitation == null) return null;

        return new InvitationResponseDTO(
                invitation.getId(),
                invitation.getFamily() != null ? invitation.getFamily().getName() : null,
                invitation.getInvitedUser() != null ? invitation.getInvitedUser().getName() : null,
                invitation.getInvitedUser() != null ? invitation.getInvitedUser().getEmail() : null,
                invitation.getRole(),
                invitation.getStatus(),
                invitation.getCreatedAt()
        );
    }*/
}
