package com.team10.famtask.board.dto;


import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CardRequestDTO {
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Boolean finished;

}