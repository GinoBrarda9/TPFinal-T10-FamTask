package com.team10.famtask.board.dto;


import lombok.Data;

import java.time.LocalDate;

@Data
public class CardRequestDTO {
    private String title;
    private String description;
    private LocalDate dueDate;
    private Boolean finished;

}