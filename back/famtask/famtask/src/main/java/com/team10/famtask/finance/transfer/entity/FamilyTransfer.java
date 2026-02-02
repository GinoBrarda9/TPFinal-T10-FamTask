package com.team10.famtask.finance.transfer.entity;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.finance.entity.MovementCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "finance_transfers",
        indexes = {
                @Index(name = "idx_finance_transfers_family_created_at", columnList = "family_id, created_at")
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FamilyTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    private MovementCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferStatus status;

    // Mercado Pago (para demo A solo mostramos el link)
    private String mpPreferenceId;
    @Column(length = 2048)
    private String mpInitPoint;
    private String mpExternalReference;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "family_id")
    private Family family;

    // Quién envía (quien genera el link)
    @ManyToOne
    @JoinColumn(name = "from_user_id")
    private User fromUser;

    // Quién recibe
    @ManyToOne
    @JoinColumn(name = "to_user_id")
    private User toUser;
}
