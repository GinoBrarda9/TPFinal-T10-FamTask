package com.team10.famtask.board.service;

import com.team10.famtask.board.dto.CardRequestDTO;
import com.team10.famtask.board.entity.BoardColumn;
import com.team10.famtask.board.entity.Card;
import com.team10.famtask.board.entity.CardStatus;
import com.team10.famtask.board.repository.CardRepository;
import com.team10.famtask.board.repository.ColumnRepository;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.UserRepository;
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
    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;

    // =========================================================================
    // CREATE
    // =========================================================================
    @Transactional
    public Card createCard(Long columnId, CardRequestDTO dto) {

        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));

        int nextPosition = cardRepository.findByColumnOrderByPosition(column).size();

        if (dto.getDueDate() != null && dto.getDueDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha límite no puede ser pasada");
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

    // =========================================================================
    // GET BY COLUMN
    // =========================================================================
    @Transactional(readOnly = true)
    public List<Card> getCardsByColumn(Long columnId) {
        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));
        return cardRepository.findByColumnOrderByPosition(column);
    }

    // =========================================================================
    // UPDATE
    // =========================================================================
    @Transactional
    public Card updateCard(Long cardId, CardRequestDTO dto) {

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        // TITLE
        if (dto.getTitle() != null && !dto.getTitle().isBlank())
            card.setTitle(dto.getTitle());

        // DESCRIPTION
        if (dto.getDescription() != null)
            card.setDescription(dto.getDescription());

        // FINISHED — incluye recomendación #3
        if (dto.getFinished() != null) {

            boolean wasDone = Boolean.TRUE.equals(card.getFinished());
            boolean willBeDone = Boolean.TRUE.equals(dto.getFinished());

            card.setFinished(dto.getFinished());

            // Si la card se REABRE → reset flags
            if (wasDone && !willBeDone) {
                card.setReminderDayBeforeSent(false);
                card.setReminderHourBeforeSent(false);
                card.setReminderExpiredSent(false);
            }
        }

        // DUE DATE — incluye recomendación #1
        if (dto.getDueDate() != null) {

            if (dto.getDueDate().isBefore(LocalDateTime.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha límite no puede ser pasada");
            }

            if (!dto.getDueDate().equals(card.getDueDate())) {
                card.setDueDate(dto.getDueDate());
                card.setReminderDayBeforeSent(false);
                card.setReminderHourBeforeSent(false);
                card.setReminderExpiredSent(false);
            }
        }

        // ASSIGNED USER
        if (dto.getAssignedUserDni() != null) {

            Long familyId = card.getColumn().getBoard().getFamily().getId();
            String dni = dto.getAssignedUserDni();

            boolean belongs = familyMemberRepository.existsById_UserDniAndId_FamilyId(dni, familyId);

            if (!belongs) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "El usuario " + dni + " no pertenece a esta familia"
                );
            }

            User assigned = userRepository.findById(dni)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

            card.setAssignedUser(assigned);
        }

        // RECOMENDACIÓN #2: recalcular SIEMPRE
        updateCardStatus(card);

        return card;
    }

    // =========================================================================
    // DELETE
    // =========================================================================
    @Transactional
    public void deleteCard(Long cardId) {

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        BoardColumn column = card.getColumn();
        cardRepository.delete(card);

        List<Card> remaining = cardRepository.findByColumnOrderByPosition(column);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPosition(i);
        }
    }

    // =========================================================================
    // MOVE WITHIN COLUMN
    // =========================================================================
    @Transactional
    public Card moveCard(Long cardId, int newPosition) {

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        BoardColumn column = card.getColumn();
        List<Card> cards = cardRepository.findByColumnOrderByPosition(column);

        cards.remove(card);

        if (newPosition < 0) newPosition = 0;
        if (newPosition > cards.size()) newPosition = cards.size();

        cards.add(newPosition, card);

        for (int i = 0; i < cards.size(); i++) {
            cards.get(i).setPosition(i);
        }

        return card;
    }

    // =========================================================================
    // MOVE TO ANOTHER COLUMN
    // =========================================================================
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

        List<Card> oldCards = cardRepository.findByColumnOrderByPosition(oldColumn);
        oldCards.remove(card);
        for (int i = 0; i < oldCards.size(); i++) {
            oldCards.get(i).setPosition(i);
        }

        List<Card> newCards = cardRepository.findByColumnOrderByPosition(newColumn);

        if (newPosition < 0) newPosition = 0;
        if (newPosition > newCards.size()) newPosition = newCards.size();

        newCards.add(newPosition, card);

        card.setColumn(newColumn);

        for (int i = 0; i < newCards.size(); i++) {
            newCards.get(i).setPosition(i);
        }

        return card;
    }

    // =========================================================================
    // UPDATE ONLY DUE DATE
    // =========================================================================
    @Transactional
    public Card updateDueDate(Long cardId, LocalDateTime dueDate) {

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        if (dueDate.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha límite no puede ser pasada");
        }

        if (!dueDate.equals(card.getDueDate())) {
            card.setDueDate(dueDate);
            card.setReminderDayBeforeSent(false);
            card.setReminderHourBeforeSent(false);
            card.setReminderExpiredSent(false);
        }

        updateCardStatus(card);

        return card;
    }

    // =========================================================================
    // STATUS UPDATE
    // =========================================================================
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

    // =========================================================================
    // FILTER BY STATUS
    // =========================================================================
    @Transactional(readOnly = true)
    public List<Card> getCardsByColumnAndStatus(Long columnId, String status) {

        BoardColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found"));

        if (status == null || status.isBlank()) {
            return cardRepository.findByColumnOrderByPosition(column);
        }

        try {
            CardStatus enumStatus = CardStatus.valueOf(status.toUpperCase());
            return cardRepository.findByColumnAndStatus(column, enumStatus);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status inválido: " + status);
        }
    }

    @Transactional
    public Card assignUser(Long cardId, String dni) {

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));

        // 🚫 Evitar asignar si ya está finalizada
        if (Boolean.TRUE.equals(card.getFinished())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No se puede asignar un usuario a una tarjeta finalizada"
            );
        }

        Long familyId = card.getColumn().getBoard().getFamily().getId();

        boolean belongs = familyMemberRepository.existsById_UserDniAndId_FamilyId(dni, familyId);

        if (!belongs) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "El usuario " + dni + " no pertenece a esta familia"
            );
        }

        User assigned = userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"));

        card.setAssignedUser(assigned);

        return cardRepository.save(card);
    }


}
