package com.team10.famtask.controller;

import com.team10.famtask.dto.FamilyDTO;
import com.team10.famtask.dto.FamilyMemberDTO;
import com.team10.famtask.dto.InvitationDTO;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.Invitation;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.service.family.FamilyService;
import com.team10.famtask.service.family.InvitationService;
import com.team10.famtask.service.security.SecurityService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService invitationService;
    private final FamilyService familyService;
    private final SecurityService securityService;

    public InvitationController(InvitationService invitationService, FamilyService familyService, SecurityService securityService) {
        this.invitationService = invitationService;
        this.familyService = familyService;
        this.securityService = securityService;
    }

    private InvitationDTO toDTO(Invitation invitation) {
        Family family = invitation.getFamily();

        List<FamilyMemberDTO> members = (family != null && family.getMembers() != null)
                ? family.getMembers().stream()
                .map(m -> new FamilyMemberDTO(
                        m.getUser().getDni(),
                        m.getUser().getName(),
                        m.getUser().getEmail(),
                        m.getRole()
                ))
                .toList()
                : List.of();

        FamilyDTO familyDTO = family != null
                ? new FamilyDTO(family.getId(), family.getName(), members)
                : null;

        FamilyMemberDTO invitedUserDTO = new FamilyMemberDTO(
                invitation.getInvitedUser().getDni(),
                invitation.getInvitedUser().getName(),
                invitation.getInvitedUser().getEmail(),
                invitation.getRole()
        );

        return new InvitationDTO(
                invitation.getId(),
                familyDTO,
                invitedUserDTO,
                invitation.getRole(),
                invitation.getStatus()
        );
    }


    // --- Endpoints ---
    @PostMapping("/invite")
    public ResponseEntity<InvitationDTO> inviteUser(@RequestBody InviteRequest request) {
        Family family = familyService.getFamilyById(request.getFamilyId());
        User invitedUser = securityService.getUserByDni(request.getInvitedUserDni());

        Invitation invitation = invitationService.createInvitation(family, invitedUser, request.getRole());
        return ResponseEntity.ok(toDTO(invitation));
    }

    @PostMapping("/{invitationId}/respond")
    public ResponseEntity<InvitationDTO> respondInvitation(@PathVariable Long invitationId,
                                                           @RequestParam boolean accept) {
        Invitation invitation = invitationService.respondInvitation(invitationId, accept);
        return ResponseEntity.ok(toDTO(invitation));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<InvitationDTO>> pendingInvitations() {
        User currentUser = securityService.getCurrentUser();
        List<InvitationDTO> pending = invitationService.getPendingInvitations(currentUser).stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(pending);
    }

    @Data
    public static class InviteRequest {
        private Long familyId;
        private String invitedUserDni;
        private String role;
    }
}
