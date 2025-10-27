package com.team10.famtask.controller;

import com.team10.famtask.dto.InvitationRequestDTO;
import com.team10.famtask.dto.InvitationResponseDTO;
import com.team10.famtask.dto.InvitationSimpleDTO;
import com.team10.famtask.entity.family.Invitation;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.service.family.FamilyService;
import com.team10.famtask.service.family.InvitationService;
import com.team10.famtask.service.security.SecurityService;
import com.team10.famtask.util.InvitationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;
    private final FamilyService familyService;
    private final SecurityService securityService;

    // =========================================================
    // Crear invitación
    // =========================================================
    @PostMapping
    public ResponseEntity<InvitationResponseDTO> createInvitation(
            @RequestBody Map<String, String> body
    ) {
        User sender = securityService.getCurrentUser();
        Long familyId = Long.valueOf(body.get("familyId"));
        String invitedUserDni = body.get("invitedUserDni");
        String role = body.get("role");

        Invitation invitation = invitationService.createInvitation(sender, familyId, invitedUserDni, role);
        return ResponseEntity.ok(InvitationMapper.toResponseDTO(invitation));
    }


    // =========================================================
    // Responder invitación
    // =========================================================

    @PostMapping("/{id}/respond")
    public ResponseEntity<InvitationResponseDTO> respondInvitation(
            @PathVariable Long id,
            @RequestParam boolean accept
    ) {
        User currentUser = securityService.getCurrentUser();
        Invitation invitation = invitationService.respondInvitation(id, accept, currentUser);
        return ResponseEntity.ok(InvitationMapper.toResponseDTO(invitation));
    }


   /* @PostMapping("/{id}/respond")
    public ResponseEntity<InvitationSimpleDTO> respondInvitation(
            @PathVariable Long id,
            @RequestParam boolean accept
    ) {
        Invitation invitation = invitationService.respondInvitation(id, accept);
        return ResponseEntity.ok(InvitationMapper.toSimpleDTO(invitation));
    }*/

    // =========================================================
    // Obtener invitaciones pendientes del usuario actual
    // =========================================================
    @GetMapping("/pending")
    public ResponseEntity<List<InvitationResponseDTO>> getPendingInvitations() {
        User currentUser = securityService.getCurrentUser();
        List<Invitation> invitations = invitationService.getPendingInvitations(currentUser);

        List<InvitationResponseDTO> dtos = invitations.stream()
                .map(InvitationMapper::toResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
