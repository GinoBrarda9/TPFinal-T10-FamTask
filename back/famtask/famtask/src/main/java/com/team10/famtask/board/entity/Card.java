package com.team10.famtask.board.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
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

    private LocalDate dueDate;          // Fecha límite
    private Boolean finished = false;   // Si ya fue completada

    private LocalDateTime createdAt;

    private Integer position;           // Orden dentro de su columna

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id")
    private BoardColumn column;

}