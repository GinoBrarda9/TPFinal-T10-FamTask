package com.team10.famtask.entity.family;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "family_members")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {

    @EmbeddedId
    private FamilyMemberId id;

    @ManyToOne
    @MapsId("userDni") // enlaza id.userDni con user.dni
    @JoinColumn(name = "user_dni", nullable = false)
    private User user;

    @ManyToOne
    @MapsId("familyId") // enlaza id.familyId con family.id
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;

    private String role;

    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        if (role == null) {
            role = "member";
        }
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }
}
