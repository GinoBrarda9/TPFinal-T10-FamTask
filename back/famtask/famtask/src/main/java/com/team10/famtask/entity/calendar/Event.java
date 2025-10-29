package com.team10.famtask.entity.calendar;

import com.team10.famtask.entity.family.Family;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "events")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;          // título del evento
    private String description;    // descripción opcional
    private LocalDateTime start;   // fecha y hora de inicio
    private LocalDateTime end;     // fecha y hora de fin

    @ManyToOne
    @JoinColumn(name = "family_id", nullable = false)
    private Family family;        // cada evento pertenece a una familia
}
