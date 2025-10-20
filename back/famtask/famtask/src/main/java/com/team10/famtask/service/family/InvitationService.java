package com.team10.famtask.service.family;

import com.team10.famtask.entity.family.*;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.InvitationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public InvitationService(InvitationRepository invitationRepository, FamilyMemberRepository familyMemberRepository) {
        this.invitationRepository = invitationRepository;
        this.familyMemberRepository = familyMemberRepository;
    }

    @Transactional
    public Invitation createInvitation(Family family, User invitedUser, String role) {
        // Verificar si ya existe una invitación
        invitationRepository.findByFamilyAndInvitedUser(family, invitedUser)
                .ifPresent(inv -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya existe una invitación para este usuario.");
                });

        Invitation invitation = new Invitation();
        invitation.setFamily(family);
        invitation.setInvitedUser(invitedUser);
        invitation.setRole(role);
        invitation.setStatus("PENDING");
        invitation.setCreatedAt(LocalDateTime.now());

        return invitationRepository.save(invitation);
    }

    @Transactional
    public Invitation respondInvitation(Long invitationId, boolean accept) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitación no encontrada"));

        if (!"PENDING".equalsIgnoreCase(invitation.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La invitación ya fue respondida");
        }

        if (accept) {
            invitation.setStatus("ACCEPTED");

            Family family = invitation.getFamily();
            User invitedUser = invitation.getInvitedUser();

            FamilyMember member = family.getMembers().stream()
                    .filter(m -> m.getUser().getDni().equals(invitedUser.getDni()))
                    .findFirst()
                    .orElseGet(() -> {
                        FamilyMember newMember = FamilyMember.builder()
                                .id(new FamilyMemberId(invitedUser.getDni(), family.getId()))
                                .user(invitedUser)
                                .family(family)
                                .role(invitation.getRole() != null ? invitation.getRole() : "member")
                                .joinedAt(LocalDateTime.now())
                                .build();
                        family.addMember(newMember);
                        return newMember;
                    });

            if (invitation.getRole() != null) {
                member.setRole(invitation.getRole());
            }

        } else {
            invitation.setStatus("REJECTED");
        }

        return invitationRepository.save(invitation);
    }


    public List<Invitation> getPendingInvitations(User user) {
        return invitationRepository.findByInvitedUserAndStatus(user, "PENDING");
    }
}
