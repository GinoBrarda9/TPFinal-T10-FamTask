package com.team10.famtask.entity.family;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class FamilyMemberId implements Serializable {
    private String userDni;   // coincide con User.dni
    private Long familyId;     // coincide con Family.id
}
