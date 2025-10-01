package com.team10.famtask.entity.board;

import com.team10.famtask.entity.family.Family;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "boards")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "family_id")
    private Family family;
}
