package com.team10.famtask.board.repository;

import com.team10.famtask.board.entity.Board;
import com.team10.famtask.board.entity.Card;
import com.team10.famtask.board.entity.BoardColumn;
import com.team10.famtask.board.entity.CardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByColumnOrderByPosition(BoardColumn column);

    @Query("SELECT c.column.board.family.id FROM Card c WHERE c.id = :cardId")
    Optional<Long> findFamilyIdByCardId(Long cardId);

    @Query("SELECT c FROM Card c WHERE c.column = :column AND c.status = :status ORDER BY c.position")
    List<Card> findByColumnAndStatus(BoardColumn column, CardStatus status);

/*    @Query("""
    SELECT c FROM Card c
    LEFT JOIN FETCH c.assignedTo at
    LEFT JOIN FETCH at.user u
    LEFT JOIN FETCH c.column col
    WHERE c.board = :board
    """)
    List<Card> findByBoardWithAll(@Param("board") Board board);*/

}
