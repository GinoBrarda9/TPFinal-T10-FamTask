package com.team10.famtask.entity.finances;

import jakarta.persistence.Entity;
import com.team10.famtask.entity.family.Family;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "accounts")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // nombre de la cuenta (ej. "Caja", "Banco")

    private Double balance; // saldo actual

    @ManyToOne
    @JoinColumn(name = "family_id", nullable = false)
    private Family family; // cada cuenta pertenece a una familia
}
