package com.team10.famtask.finance.entity;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "finance_movements",
        indexes = {
                @Index(
                        name = "idx_finance_movements_family_created_at",
                        columnList = "family_id, created_at"
                )
        }
)
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

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    @ManyToOne
    @JoinColumn(name = "family_id")
    private Family family;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

}

