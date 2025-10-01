package com.team10.famtask.entity.family;

import com.team10.famtask.entity.board.Board;
import com.team10.famtask.entity.calendar.Event;
import com.team10.famtask.entity.finances.Account;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "families")
public class Family {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL)
    private List<FamilyMember> members;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL)
    private List<Board> boards;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL)
    private List<Account> accounts;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL)
    private List<Event> events;
}
