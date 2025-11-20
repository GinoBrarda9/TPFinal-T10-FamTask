package com.team10.famtask.board.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;


@Data
@Builder
public class CardResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Boolean finished;
    private Integer position;
    private Long columnId;
    private String assignedUserDni;

}
