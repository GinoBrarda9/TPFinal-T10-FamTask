package com.team10.famtask.board.repository;

import com.team10.famtask.board.entity.Card;
import com.team10.famtask.board.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByColumnOrderByPosition(BoardColumn column);

    @Query("SELECT c.column.board.family.id FROM Card c WHERE c.id = :cardId")
    Optional<Long> findFamilyIdByCardId(Long cardId);

}
