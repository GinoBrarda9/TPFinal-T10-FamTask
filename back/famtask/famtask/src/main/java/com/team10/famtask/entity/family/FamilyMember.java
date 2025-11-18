package com.team10.famtask.entity.family;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class FamilyMember {

    @EmbeddedId
    private FamilyMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userDni") // vincula el campo de FamilyMemberId.userDni
    @JoinColumn(name = "user_dni")
    @JsonBackReference
    @JsonIgnore

    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("familyId") // vincula el campo de FamilyMemberId.familyId
    @JoinColumn(name = "family_id")
    @JsonIgnore
    private Family family;

    private String role;

    private LocalDateTime joinedAt;
}
