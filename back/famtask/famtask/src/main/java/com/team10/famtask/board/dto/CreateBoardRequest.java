package com.team10.famtask.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateBoardRequest {
    @NotBlank
    private String name;
    private String description;
}