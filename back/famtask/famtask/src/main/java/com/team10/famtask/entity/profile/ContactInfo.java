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
    //@Pattern(

        //    message = "Número inválido. Debe estar en formato internacional (ej: +54 9 351 2545802)"
    //)
    private String phone;


}
