package com.team10.famtask.entity.family;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "invitations")
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK correcta a families.id
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_invitations_family"))
    private Family family;

    // FK a users.dni (si tu User tiene @Id String dni)
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_user_id", referencedColumnName = "dni", nullable = false,
            foreignKey = @ForeignKey(name = "fk_invitations_user"))
    private User invitedUser;

    @Column(nullable = false)
    private String role; // "ADMIN" | "USER" | "member", etc. (sin romper front)

    @Column(nullable = false)
    private String status; // "PENDING" | "ACCEPTED" | "REJECTED"

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
