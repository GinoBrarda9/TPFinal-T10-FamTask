package com.team10.famtask.board.service;


import com.team10.famtask.board.dto.ColumnDTO;
import com.team10.famtask.board.dto.UpdateBoardRequest;
import com.team10.famtask.board.entity.Board;
import com.team10.famtask.board.entity.BoardColumn;
import com.team10.famtask.board.repository.BoardRepository;
import com.team10.famtask.board.repository.ColumnRepository;
import com.team10.famtask.board.dto.CreateBoardRequest;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.repository.family.FamilyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final FamilyRepository familyRepository;
    private final ColumnRepository columnRepository;

    @Transactional
    public Board createBoardForFamily(Long familyId, CreateBoardRequest req) {
        return boardRepository.findByFamilyId(familyId).orElseGet(() -> {
            Family family = familyRepository.findById(familyId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Family not found"));

            Board board = Board.builder()
                    .family(family)
                    .name(req.getName())
                    .description(req.getDescription())
                    .build();

            boardRepository.save(board);
            createDefaultColumns(board);
            return boardRepository.save(board);
        });
    }


    @Transactional
    public Board getBoardByFamily(Long familyId) {
        return boardRepository.findByFamilyId(familyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found for this family"));
    }

    private void createDefaultColumns(Board board) {
        String[] names = {"Por Hacer", "En Proceso", "Finalizado"};

        for (int i = 0; i < names.length; i++) {
            BoardColumn col = BoardColumn.builder()
                    .name(names[i])
                    .position(i)
                    .board(board)
                    .build();

            columnRepository.save(col);
            board.getColumns().add(col);
        }
    }

    @Transactional
    public BoardColumn createColumn(Long boardId, String name) {

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        // posición = última + 1
        int newPos = board.getColumns().size();

        BoardColumn col = BoardColumn.builder()
                .name(name)
                .position(newPos)
                .board(board)
                .build();

        columnRepository.save(col);
        board.getColumns().add(col);

        return col;
    }


    @Transactional
    public Board patchBoard(Long boardId, UpdateBoardRequest req) {
        Board board = boardRepository.findWithColumnsById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        if (req.getName() != null && !req.getName().isBlank()) {
            board.setName(req.getName());
        }
        if (req.getDescription() != null) {
            board.setDescription(req.getDescription());
        }

        return board;
    }

    @Transactional
    public void deleteBoard(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        boardRepository.delete(board);
    }


    @Transactional
    public BoardColumn renameColumn(Long columnId, String newName) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));

        if (newName != null && !newName.isBlank()) {
            column.setName(newName);
        }

        return column;
    }

    @Transactional(readOnly = true)
    public List<ColumnDTO> getColumns(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        return board.getColumns()
                .stream()
                .sorted(Comparator.comparing(c -> c.getPosition()))
                .map(c -> ColumnDTO.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .position(c.getPosition())
                        .build()
                )
                .toList();
    }


    @Transactional
    public void deleteColumn(Long columnId) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));

        columnRepository.delete(column);
    }

    @Transactional
    public BoardColumn moveColumn(Long columnId, int newPosition) {

        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));

        Board board = column.getBoard();

        List<BoardColumn> columns = board.getColumns()
                .stream()
                .sorted(Comparator.comparing(BoardColumn::getPosition))
                .collect(Collectors.toList());  // ✅ lista mutable

        // quitar columna
        columns.remove(column);

        // proteger que no meta una posición fuera de rango
        if (newPosition < 0 || newPosition > columns.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid new position");
        }

        // insertar en nueva posición
        columns.add(newPosition, column);

        // reasignar posiciones y guardar
        for (int i = 0; i < columns.size(); i++) {
            columns.get(i).setPosition(i);
            columnRepository.save(columns.get(i));
        }

        return column;
    }




}
