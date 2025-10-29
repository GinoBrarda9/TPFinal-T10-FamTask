package com.team10.famtask.event.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String color;
    private boolean allDay;
    private Long familyId;
    private String memberDni;
    private String googleEventId;
}

