package com.team10.famtask.board.controller;

import com.team10.famtask.board.dto.*;
import com.team10.famtask.board.entity.Board;
import com.team10.famtask.board.entity.BoardColumn;
import com.team10.famtask.board.mapper.BoardMapper;
import com.team10.famtask.board.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardController {

    private final BoardMapper boardMapper;

    private final BoardService boardService;

    public BoardController(BoardMapper boardMapper, BoardService boardService) {
        this.boardMapper = boardMapper;
        this.boardService = boardService;
    }

    @PostMapping("/family/{familyId}")
    @PreAuthorize("@securityService.isMemberOfFamily(#familyId, authentication)")
    public BoardDTO createBoard(@PathVariable Long familyId,
                                @Valid @RequestBody CreateBoardRequest request) {
        Board board = boardService.createBoardForFamily(familyId, request);
        return boardMapper.toBoardDTO(board);
    }


    @GetMapping("/family/{familyId}")
    @PreAuthorize("@securityService.isMemberOfFamily(#familyId, authentication)")
    public BoardDTO getBoard(@PathVariable Long familyId) {
        Board board = boardService.getBoardByFamily(familyId);
        return boardMapper.toBoardDTO(board);
    }

    @PatchMapping("/{boardId}")
    @PreAuthorize("@securityService.isMemberOfBoard(#boardId, authentication)")
    public BoardDTO patchBoard(@PathVariable Long boardId,
                               @RequestBody UpdateBoardRequest request) {
        Board board = boardService.patchBoard(boardId, request);
        return boardMapper.toBoardDTO(board);
    }

    @DeleteMapping("/{boardId}")
    @PreAuthorize("@securityService.isMemberOfBoard(#boardId, authentication)")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{boardId}/column")
    @PreAuthorize("@securityService.isMemberOfBoard(#boardId, authentication)")
    public ColumnDTO createColumn(@PathVariable Long boardId,
                                  @RequestBody ColumnUpdateDTO dto) {

        BoardColumn newCol = boardService.createColumn(boardId, dto.getName());
        return ColumnDTO.builder()
                .id(newCol.getId())
                .name(newCol.getName())
                .position(newCol.getPosition())
                .build();
    }


    @PatchMapping("/column/{columnId}")
    @PreAuthorize("@securityService.isColumnAccessible(#columnId, authentication)")
    public ColumnDTO renameColumn(@PathVariable Long columnId, @RequestBody ColumnUpdateDTO dto, Authentication authentication) {
        BoardColumn updated = boardService.renameColumn(columnId, dto.getName());
        return ColumnDTO.builder()
                .id(updated.getId())
                .name(updated.getName())
                .position(updated.getPosition())
                .build();
    }

    @GetMapping("/{boardId}/columns")
    @PreAuthorize("@securityService.isMemberOfBoard(#boardId, authentication)")
    public List<ColumnDTO> getBoardColumns(@PathVariable Long boardId, Authentication authentication) {
        return boardService.getColumns(boardId);
    }


    @DeleteMapping("/column/{columnId}")
    @PreAuthorize("@securityService.isColumnAccessible(#columnId, authentication)")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long columnId) {
        boardService.deleteColumn(columnId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/column/{columnId}/move")
    @PreAuthorize("@securityService.isColumnAccessible(#columnId, authentication)")
    public ColumnDTO moveColumn(@PathVariable Long columnId, @RequestBody ColumnMoveDTO dto) {
        BoardColumn updated = boardService.moveColumn(columnId, dto.getNewPosition());
        return ColumnDTO.builder()
                .id(updated.getId())
                .name(updated.getName())
                .position(updated.getPosition())
                .build();
    }


}
