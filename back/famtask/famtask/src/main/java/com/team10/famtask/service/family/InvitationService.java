package com.team10.famtask.service.family;

import com.team10.famtask.entity.family.*;
import com.team10.famtask.repository.family.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FamilyMemberRepository familyMemberRepository;

    // =========================================================
    // Crear invitación
    // =========================================================
    @Transactional
    public Invitation createInvitation(User sender, Long familyId, String invitedEmail, String role) {
     /*   // Verificamos que la familia exista realmente en la base
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new IllegalArgumentException("La familia especificada no existe en la base de datos"));

        // Verificamos que el usuario invitado exista
        User invitedUser = userRepository.findById(invitedUserDni)
                .orElseThrow(() -> new IllegalArgumentException("El usuario invitado no existe"));

        // Creamos la invitación
        Invitation invitation = Invitation.builder()
                .family(family)
                .invitedUser(invitedUser)
                .role(role)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        // Guardamos y flusheamos para forzar inserción
        return invitationRepository.saveAndFlush(invitation);
    } */

        // 1. Verificar que la familia exista
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new IllegalArgumentException("La familia especificada no existe."));

        // 2. Verificar que el usuario invitado exista por email
        User invitedUser = userRepository.findByEmail(invitedEmail)
                .orElseThrow(() -> new IllegalArgumentException("El usuario invitado no existe."));




        // 4. Crear la invitación
        Invitation invitation = Invitation.builder()
                .family(family)
                .invitedUser(invitedUser)
                .role(role)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        Invitation saved = invitationRepository.saveAndFlush(invitation);

        // 5. Inicializar relaciones para evitar LazyInitializationException
        saved.getFamily().getName();
        saved.getInvitedUser().getName();
        saved.getInvitedUser().getEmail();

        return saved;
    }

    @Transactional
    public Invitation respondInvitation(Long invitationId, boolean accept, User currentUser) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitación no encontrada."));

        // Validar que la invitación pertenece al usuario actual
        if (!invitation.getInvitedUser().getDni().equals(currentUser.getDni())) {
            throw new IllegalStateException("No estás autorizado para responder esta invitación.");
        }

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new IllegalStateException("La invitación ya fue respondida.");
        }

        if (accept) {
            invitation.setStatus("ACCEPTED");

            Family family = invitation.getFamily();
            User invitedUser = invitation.getInvitedUser();

            FamilyMemberId memberId = new FamilyMemberId(invitedUser.getDni(), family.getId());
            FamilyMember member = new FamilyMember(
                    memberId,
                    invitedUser,
                    family,
                    invitation.getRole(),
                    LocalDateTime.now()
            );

            familyMemberRepository.save(member);
        } else {
            invitation.setStatus("REJECTED");
        }

        Invitation saved = invitationRepository.save(invitation);

        // Forzar carga de relaciones para evitar LazyInitializationException
        saved.getFamily().getName();
        saved.getInvitedUser().getName();
        saved.getInvitedUser().getEmail();

        return saved;
    }


    // =========================================================
    // Responder invitación (aceptar / rechazar)
    // =========================================================
   /* @Transactional
    public Invitation respondInvitation(Long invitationId, boolean accept) {
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitación no encontrada"));

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new IllegalStateException("La invitación ya fue respondida");
        }

        if (accept) {
            invitation.setStatus("ACCEPTED");

            Family family = invitation.getFamily();
            User invitedUser = invitation.getInvitedUser();

            FamilyMemberId memberId = new FamilyMemberId(invitedUser.getDni(), family.getId());
            FamilyMember member = new FamilyMember(
                    memberId,
                    invitedUser,
                    family,
                    invitation.getRole(),
                    LocalDateTime.now()
            );

            familyMemberRepository.save(member);
        } else {
            invitation.setStatus("REJECTED");
        }

        return invitationRepository.save(invitation);
    }
*/
    // =========================================================
    // Invitaciones pendientes para un usuario
    // =========================================================
    @Transactional(readOnly = true)
    public List<Invitation> getPendingInvitations(User currentUser) {
        return invitationRepository.findPendingWithJoins(currentUser, "PENDING");
    }
}
