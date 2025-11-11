package com.team10.famtask.board.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@Table(name = "board_column")
@NoArgsConstructor @AllArgsConstructor @Builder
public class BoardColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    @JsonBackReference
    private Board board;
}
