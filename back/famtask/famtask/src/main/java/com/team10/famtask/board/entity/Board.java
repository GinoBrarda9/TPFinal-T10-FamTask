package com.team10.famtask.board.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.team10.famtask.entity.family.Family;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String name;
    private String description;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", unique = true)
    private Family family;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    @Builder.Default
    @JsonManagedReference
    private List<BoardColumn> columns = new ArrayList<>();
}
