package com.team10.famtask.board.mapper;

import com.team10.famtask.board.dto.BoardDTO;
import com.team10.famtask.board.dto.ColumnDTO;
import com.team10.famtask.board.entity.Board;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BoardMapper {

    public BoardDTO toBoardDTO(Board board) {
        return BoardDTO.builder()
                .boardId(board.getId())
                .familyId(board.getFamily().getId())
                .name(board.getName())
                .description(board.getDescription())
                .columns(board.getColumns().stream()
                        .map(c -> ColumnDTO.builder()
                                .id(c.getId())
                                .name(c.getName())
                                .position(c.getPosition())
                                .build())
                        .toList())
                .build();
    }



}