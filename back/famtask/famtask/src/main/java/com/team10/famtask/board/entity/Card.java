package com.team10.famtask.board.entity;

import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 300)
    private String description;

    private LocalDateTime dueDate;          // Fecha límite
    private Boolean finished = false;   // Si ya fue completada

    private LocalDateTime createdAt;

    private Integer position;           // Orden dentro de su columna

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id")
    private BoardColumn column;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_dni")
    private User assignedUser;


    private Boolean reminderDayBeforeSent = false;     // recordatorio 24 hs antes
    private Boolean reminderHourBeforeSent = false;    // recordatorio 1 hora antes
    private Boolean reminderExpiredSent = false;       // vencida y no finalizada

    @Enumerated(EnumType.STRING)
    private CardStatus status;


}