package com.team10.famtask.entity.family;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class FamilyMember {

    @EmbeddedId
    private FamilyMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userDni") // vincula el campo de FamilyMemberId.userDni
    @JoinColumn(name = "user_dni")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("familyId") // vincula el campo de FamilyMemberId.familyId
    @JoinColumn(name = "family_id")
    private Family family;

    private String role;

    private LocalDateTime joinedAt;
}
