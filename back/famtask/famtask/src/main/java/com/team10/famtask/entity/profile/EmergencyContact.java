package com.team10.famtask.entity.profile;

import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "emergency_contacts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String contactName;     // nombre del contacto
    private String phoneNumber;     // teléfono
    private String relationship;    // relación con el usuario

    @OneToOne
    @JoinColumn(name = "user_dni", nullable = false, unique = true)
    private User user;
}
