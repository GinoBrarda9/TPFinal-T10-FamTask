package com.team10.famtask.entity.family;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.team10.famtask.entity.profile.ContactInfo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 20, nullable = false, unique = true)
    private String dni; // DNI como PK

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String passwordHash;

    private String role;

    private LocalDateTime createdAt;

    // 🔥 Evita error de lazy loading y recursión infinita
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<FamilyMember> familyMemberships = new ArrayList<>();

    /** ID único de Google del usuario (sub del id_token) */
    @Column(name = "google_id", unique = true)
    private String googleId;

    /** Email que viene desde Google (puede coincidir con email normal) */
    @Column(name = "google_email")
    private String googleEmail;

    /** Si ya otorgó permisos y tenemos refresh_token */
    @Column(name = "google_linked", nullable = false)
    private boolean googleLinked = false;

    /** Access token temporal (se refresca automáticamente) */
    @Lob
    @JsonIgnore
    @Column(name = "google_access_token")
    private String googleAccessToken;

    /** Refresh token para acceder siempre a la API de Calendar */
    @Lob
    @JsonIgnore
    @Column(name = "google_refresh_token")
    private String googleRefreshToken;

    @Column(name = "google_token_updated_at")
    private LocalDateTime googleTokenUpdatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (role == null) {
            role = "USER";
        }
    }

    // 🔹 Relación con ContactInfo (no rompe nada)
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ContactInfo contactInfo;

    // 🔹 Getter auxiliar para evitar nulls
    @Transient
    public String getPhone() {
        return (contactInfo != null) ? contactInfo.getPhone() : null;
    }
}
