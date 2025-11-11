package com.team10.famtask.board.entity;

import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TaskCard {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDate dueDate;
    private String priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_dni")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id")
    private BoardColumn column;

    private Integer position;
}
