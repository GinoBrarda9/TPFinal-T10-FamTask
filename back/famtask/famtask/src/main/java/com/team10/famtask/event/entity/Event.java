package com.team10.famtask.event.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String color;
    private boolean allDay;
    private boolean reminderDayBeforeSent;
    private boolean reminderHourBeforeSent;

    @Column(nullable = false)
    private boolean finished = false;



    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "family_id", nullable = true) //
    private Family family;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumns({
            @JoinColumn(name = "member_user_dni", referencedColumnName = "user_dni"),
            @JoinColumn(name = "member_family_id", referencedColumnName = "family_id")
    })

    @JsonIgnore
    private FamilyMember assignedTo;

    private String googleEventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnore
    private User createdBy;

}