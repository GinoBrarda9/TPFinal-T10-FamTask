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
    public Invitation createInvitation(User sender, Long familyId, String invitedEmail, String role, String familyRole) {

        // 1) Verificar que la familia exista
        Family family = familyRepository.findById(familyId)
                .orElseThrow(() -> new IllegalArgumentException("La familia especificada no existe."));

        // 2) Verificar que el usuario invitado exista por email
        User invitedUser = userRepository.findByEmail(invitedEmail)
                .orElseThrow(() -> new IllegalArgumentException("El usuario invitado no existe."));

        // 3) Evitar invitar a alguien que ya pertenece a la familia
        FamilyMemberId memberId = new FamilyMemberId(invitedUser.getDni(), family.getId());
        if (familyMemberRepository.existsById(memberId)) {
            throw new IllegalStateException("El usuario ya pertenece a esta familia.");
        }

        // 4) Normalizar roles (PASO 5)
        String permission = normalizePermissionRole(role);   // ADMIN | USER (default USER)
        String famRole = normalizeFamilyRole(familyRole);    // PARENT | CHILD (default PARENT)

        // 5) Crear invitación
        Invitation invitation = Invitation.builder()
                .family(family)
                .invitedUser(invitedUser)
                .role(permission)
                .familyRole(famRole)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        Invitation saved = invitationRepository.saveAndFlush(invitation);

        // 6) Inicializar relaciones para evitar LazyInitializationException
        saved.getFamily().getName();
        saved.getInvitedUser().getName();
        saved.getInvitedUser().getEmail();

        return saved;
    }

    // =========================================================
    // Responder invitación (aceptar / rechazar)
    // =========================================================
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

            // Evitar duplicados por si se acepta dos veces o hay race condition
            if (!familyMemberRepository.existsById(memberId)) {

                String permission = normalizePermissionRole(invitation.getRole());
                FamilyRole famRoleEnum = FamilyRole.valueOf(normalizeFamilyRole(invitation.getFamilyRole()));

                FamilyMember member = FamilyMember.builder()
                        .id(memberId)
                        .user(invitedUser)
                        .family(family)
                        .role(permission)           // ADMIN | USER
                        .familyRole(famRoleEnum)    // PARENT | CHILD
                        .joinedAt(LocalDateTime.now())
                        .build();

                familyMemberRepository.save(member);
            }

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
    // Invitaciones pendientes para un usuario
    // =========================================================
    @Transactional(readOnly = true)
    public List<Invitation> getPendingInvitations(User currentUser) {
        return invitationRepository.findPendingWithJoins(currentUser, "PENDING");
    }

    // =========================================================
    // Helpers (solo ADMIN/USER y PARENT/CHILD)
    // =========================================================
    private String normalizePermissionRole(String role) {
        if (role == null || role.isBlank()) return "USER";
        String normalized = role.trim().toUpperCase();
        return (normalized.equals("ADMIN") || normalized.equals("USER")) ? normalized : "USER";
    }

    private String normalizeFamilyRole(String familyRole) {
        if (familyRole == null || familyRole.isBlank()) return "PARENT";
        String normalized = familyRole.trim().toUpperCase();
        return (normalized.equals("PARENT") || normalized.equals("CHILD")) ? normalized : "PARENT";
    }
}
