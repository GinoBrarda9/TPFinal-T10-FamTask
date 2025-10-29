package com.team10.famtask.entity.profile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
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

    private String phone;
    private String address;
    private String city;
    private String province;
    private String country;

    @OneToOne
    @JoinColumn(name = "user_dni", nullable = false, unique = true)
    @JsonIgnore
    private User user;
}
