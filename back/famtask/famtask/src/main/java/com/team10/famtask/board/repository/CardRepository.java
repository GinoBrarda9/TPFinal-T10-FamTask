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

    @Query("""
        select c from Card c
        left join fetch c.assignedUser
        where c.column = :column
        order by c.position
    """)
    List<Card> findByColumnWithAssignedUser(@Param("column") BoardColumn column);

    @Query("""
        select c from Card c
        left join fetch c.assignedUser
        where c.column = :column and c.status = :status
        order by c.position
    """)
    List<Card> findByColumnAndStatusWithAssignedUser(@Param("column") BoardColumn column,
                                                     @Param("status") CardStatus status);

    @Query("""
    select c from Card c
    left join fetch c.assignedUser
    where c.id = :id
""")
    Optional<Card> findByIdWithAssignedUser(@Param("id") Long id);

    @Query("""
        select c from Card c
        left join fetch c.assignedUser
        where c.column = :column
        order by c.position
    """)
    List<Card> findByColumnOrderByPosition(@Param("column") BoardColumn column);

    @Query("select c.column.board.family.id from Card c where c.id = :cardId")
    Optional<Long> findFamilyIdByCardId(@Param("cardId") Long cardId);

    @Query("""
        select c from Card c
        left join fetch c.assignedUser
        where c.column = :column and c.status = :status
        order by c.position
    """)
    List<Card> findByColumnAndStatus(@Param("column") BoardColumn column,
                                     @Param("status") CardStatus status);

    // (Opcional) si querés que el findById normal también venga con user
    // en vez de acordarte de usar findByIdWithAssignedUser:
    @Query("""
        select c from Card c
        left join fetch c.assignedUser
        where c.id = :id
    """)
    Optional<Card> findById(@Param("id") Long id);

/*    @Query("""
    SELECT c FROM Card c
    LEFT JOIN FETCH c.assignedTo at
    LEFT JOIN FETCH at.user u
    LEFT JOIN FETCH c.column col
    WHERE c.board = :board
    """)
    List<Card> findByBoardWithAll(@Param("board") Board board);*/

}
