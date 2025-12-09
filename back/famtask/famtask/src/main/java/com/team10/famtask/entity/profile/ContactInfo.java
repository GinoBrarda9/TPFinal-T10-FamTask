package com.team10.famtask.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Entity
@Table(name = "contact_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String address;
    private String city;
    private String province;
    private String country;

    @OneToOne
    @JoinColumn(name = "user_dni", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    // 📱 Número en formato E.164 (WhatsApp friendly)
    // Validación solo si el campo no está vacío
    @Pattern(regexp = "^$|^\\+?[1-9]\\d{7,14}$", message = "Número inválido. Debe estar en formato internacional E.164 (ej: +5491123456789)")
    private String phone;

}
