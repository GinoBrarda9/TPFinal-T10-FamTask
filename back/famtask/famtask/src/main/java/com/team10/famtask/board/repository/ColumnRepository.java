package com.team10.famtask.board.repository;

import com.team10.famtask.board.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ColumnRepository extends JpaRepository<BoardColumn, Long> {
    List<BoardColumn> findByBoard_IdOrderByPosition(Long boardId);

    @Query("SELECT c.board.family.id FROM BoardColumn c WHERE c.id = :columnId")
    Optional<Long> findFamilyIdByColumnId(Long columnId);

}