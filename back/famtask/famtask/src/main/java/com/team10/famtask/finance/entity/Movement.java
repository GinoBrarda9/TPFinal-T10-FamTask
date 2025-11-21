package com.team10.famtask.finance.entity;

import com.team10.famtask.entity.family.Family;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "finance_movements")
@Getter @Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Movement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;

    private String description;

    @Enumerated(EnumType.STRING)
    private MovementCategory category;

    @Enumerated(EnumType.STRING)
    private MovementType type;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "family_id")
    private Family family;
}

