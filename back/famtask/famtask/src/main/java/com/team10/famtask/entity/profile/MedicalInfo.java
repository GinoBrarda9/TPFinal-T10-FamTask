package com.team10.famtask.entity.profile;

import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medical_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String healthInsurance;   // obra social
    private String membershipNumber;  // número de afiliado
    private String bloodType;         // tipo de sangre
    private String allergies;         // alergias

    @OneToOne
    @JoinColumn(name = "user_dni", nullable = false, unique = true)
    private User user;
}
