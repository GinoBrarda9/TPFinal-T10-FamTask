package com.team10.famtask.board.service;

import com.team10.famtask.board.dto.CardRequestDTO;
import com.team10.famtask.board.entity.BoardColumn;
import com.team10.famtask.board.entity.Card;
import com.team10.famtask.board.entity.CardStatus;
import com.team10.famtask.board.repository.CardRepository;
import com.team10.famtask.board.repository.ColumnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
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

        if (dto.getDueDate() != null && dto.getDueDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha límite no puede ser pasada"
            );
        }

        Card card = Card.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .finished(false)
                .createdAt(LocalDateTime.now())
                .column(column)
                .position(nextPosition)
                .build();
        updateCardStatus(card);

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
        if (dto.getFinished() != null)
            card.setFinished(dto.getFinished());
        if (dto.getDueDate() != null) {
            if (dto.getDueDate().isBefore(LocalDateTime.now())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La fecha límite no puede ser pasada"
                );
            }
            card.setDueDate(dto.getDueDate());
            updateCardStatus(card);

        }


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

    @Transactional
    public Card moveCardToColumn(Long cardId, Long newColumnId, int newPosition) {

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        BoardColumn oldColumn = card.getColumn();
        BoardColumn newColumn = columnRepository.findById(newColumnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));

        if (!oldColumn.getBoard().getId().equals(newColumn.getBoard().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot move card to different board");
        }

        // Quitar de la columna vieja
        List<Card> oldCards = cardRepository.findByColumnOrderByPosition(oldColumn);
        oldCards.remove(card);

        for (int i = 0; i < oldCards.size(); i++) {
            oldCards.get(i).setPosition(i);
        }

        // Insertar en la nueva columna
        List<Card> newCards = cardRepository.findByColumnOrderByPosition(newColumn);

        if (newPosition < 0) newPosition = 0;
        if (newPosition > newCards.size()) newPosition = newCards.size();

        newCards.add(newPosition, card);

        card.setColumn(newColumn);

        // Reindexar nueva columna
        for (int i = 0; i < newCards.size(); i++) {
            newCards.get(i).setPosition(i);
        }

        return card;

        }


        @Transactional
        public Card updateDueDate(Long cardId, LocalDateTime dueDate) {
            Card card = cardRepository.findById(cardId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));
            if (dueDate.isBefore(LocalDateTime.now())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La fecha límite no puede ser pasada"
                );
            }
            card.setDueDate(dueDate);
            card.setReminderDayBeforeSent(false);
            card.setReminderHourBeforeSent(false);
            card.setReminderExpiredSent(false);
            updateCardStatus(card);

            return card;
    }

    private void updateCardStatus(Card card) {
        if (Boolean.TRUE.equals(card.getFinished())) {
            card.setStatus(CardStatus.DONE);
            return;
        }

        if (card.getDueDate() == null) {
            card.setStatus(CardStatus.PENDING);
            return;
        }

        long minutesLeft = Duration.between(LocalDateTime.now(), card.getDueDate()).toMinutes();

        if (minutesLeft <= 0) {
            card.setStatus(CardStatus.OVERDUE);
        } else if (minutesLeft <= 1440) {
            card.setStatus(CardStatus.NEAR_DUE);
        } else {
            card.setStatus(CardStatus.PENDING);
        }
    }

    @Transactional(readOnly = true)
    public List<Card> getCardsByColumnAndStatus(Long columnId, String status) {

        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));

        if (status == null || status.isBlank()) {
            // sin filtro → todas
            return cardRepository.findByColumnOrderByPosition(column);
        }

        try {
            CardStatus enumStatus = CardStatus.valueOf(status.toUpperCase());
            return cardRepository.findByColumnAndStatus(column, enumStatus);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido: " + status);
        }
    }


}
