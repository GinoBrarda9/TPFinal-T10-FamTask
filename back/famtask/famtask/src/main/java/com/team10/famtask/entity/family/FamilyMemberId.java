package com.team10.famtask.entity.family;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class FamilyMemberId implements Serializable {

    private String userDni;
    private Long familyId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FamilyMemberId that)) return false;
        return Objects.equals(userDni, that.userDni) &&
                Objects.equals(familyId, that.familyId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userDni, familyId);
    }
}
