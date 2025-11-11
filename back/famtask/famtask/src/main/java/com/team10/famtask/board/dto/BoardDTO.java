package com.team10.famtask.board.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BoardDTO {
    private Long boardId;
    private Long familyId;
    private String name;
    private String description;
    private List<ColumnDTO> columns;
}
