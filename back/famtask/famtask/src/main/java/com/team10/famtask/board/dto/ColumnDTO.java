package com.team10.famtask.board.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ColumnDTO {
    private Long id;
    private String name;
    private Integer position;
}
