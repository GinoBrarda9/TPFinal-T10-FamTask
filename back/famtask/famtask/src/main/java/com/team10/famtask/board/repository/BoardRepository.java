package com.team10.famtask.board.repository;


import com.team10.famtask.board.entity.Board;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    @EntityGraph(attributePaths = "columns")
    Optional<Board> findByFamilyId(Long familyId);

    @Query("SELECT b FROM Board b LEFT JOIN FETCH b.columns WHERE b.id = :boardId")
    Optional<Board> findWithColumnsById(Long boardId);

    @Query("SELECT c.board.family.id FROM BoardColumn c WHERE c.id = :columnId")
    Optional<Long> findFamilyIdByColumnId(Long columnId);

    @Query("SELECT b FROM Board b LEFT JOIN FETCH b.columns WHERE b.id = :boardId")
    Optional<Board> findWithColumns(Long boardId);



}
