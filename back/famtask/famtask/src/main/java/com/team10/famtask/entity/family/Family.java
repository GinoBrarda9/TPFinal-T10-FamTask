package com.team10.famtask.entity.family;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Entity
@Table(name = "families")
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "family", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FamilyMember> members = new ArrayList<>();

    public void addMember(FamilyMember member) {
        if (member == null) return;

        // setear el lado dueño de la relación
        member.setFamily(this);

        // si usás clave compuesta (family_id + user_dni), asegurá el user_dni en el id
        if (member.getId() == null) {
            FamilyMemberId pk = new FamilyMemberId();
            if (member.getUser() != null) {
                pk.setUserDni(member.getUser().getDni());
            }
            // el family_id se completa solo al persistir si tenés @MapsId("familyId") en FamilyMember
            member.setId(pk);
        }

        // evitar duplicados
        if (this.members == null) {
            this.members = new ArrayList<>();
        }
        if (!this.members.contains(member)) {
            this.members.add(member);
        }
    }

}
