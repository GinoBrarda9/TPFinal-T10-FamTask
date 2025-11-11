package com.team10.famtask.board.service;

import com.team10.famtask.board.dto.CardRequestDTO;
import com.team10.famtask.board.entity.BoardColumn;
import com.team10.famtask.board.entity.Card;
import com.team10.famtask.board.repository.CardRepository;
import com.team10.famtask.board.repository.ColumnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final ColumnRepository columnRepository;

    @Transactional
    public Card createCard(Long columnId, CardRequestDTO dto) {

        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));

        int nextPosition = cardRepository.findByColumnOrderByPosition(column).size();

        Card card = Card.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .finished(false)
                .createdAt(LocalDateTime.now())
                .column(column)
                .position(nextPosition)
                .build();

        return cardRepository.save(card);
    }

    @Transactional(readOnly = true)
    public List<Card> getCardsByColumn(Long columnId) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));
        return cardRepository.findByColumnOrderByPosition(column);
    }

    @Transactional
    public Card updateCard(Long cardId, CardRequestDTO dto) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        if (dto.getTitle() != null && !dto.getTitle().isBlank())
            card.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            card.setDescription(dto.getDescription());
        if (dto.getDueDate() != null)
            card.setDueDate(dto.getDueDate());
        if (dto.getFinished() != null)
            card.setFinished(dto.getFinished());


        return card;
    }

    @Transactional
    public void deleteCard(Long cardId) {

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        BoardColumn column = card.getColumn();
        cardRepository.delete(card);

        // Reordenar posiciones
        List<Card> remaining = cardRepository.findByColumnOrderByPosition(column);

        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPosition(i);
        }
    }

    @Transactional
    public Card moveCard(Long cardId, int newPosition) {

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        BoardColumn column = card.getColumn();

        List<Card> cards = cardRepository.findByColumnOrderByPosition(column);

        // Quitar la card actual
        cards.remove(card);

        // Insertar en nueva posición con control de límites
        if (newPosition < 0) newPosition = 0;
        if (newPosition > cards.size()) newPosition = cards.size();

        cards.add(newPosition, card);

        // Reindexar todas
        for (int i = 0; i < cards.size(); i++) {
            cards.get(i).setPosition(i);
        }

        return card;
    }

}
