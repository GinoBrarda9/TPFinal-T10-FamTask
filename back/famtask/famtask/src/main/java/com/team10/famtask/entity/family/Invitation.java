package com.team10.famtask.entity.family;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "invitations")
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;

    @ManyToOne
    @JoinColumn(name = "invited_user_id", nullable = false)
    private User invitedUser;

    @Column(nullable = false)
    private String role; // rol que tendrá el usuario en la familia (ej: "USER")

    @Column(nullable = false)
    private String status; // PENDING, ACCEPTED, REJECTED

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
