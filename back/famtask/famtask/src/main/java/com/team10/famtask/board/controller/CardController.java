package com.team10.famtask.board.controller;

import com.team10.famtask.board.dto.CardRequestDTO;
import com.team10.famtask.board.dto.CardResponseDTO;
import com.team10.famtask.board.entity.Card;
import com.team10.famtask.board.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    // CREATE
    @PostMapping("/column/{columnId}")
    @PreAuthorize("@securityService.isColumnAccessible(#columnId)")
    public ResponseEntity<CardResponseDTO> create(
            @PathVariable Long columnId,
            @RequestBody CardRequestDTO dto) {

        Card card = cardService.createCard(columnId, dto);

        return ResponseEntity.ok(toDTO(card));
    }

    // GET with optional status filter
    @GetMapping("/column/{columnId}")
    @PreAuthorize("@securityService.isColumnAccessible(#columnId)")
    public ResponseEntity<List<CardResponseDTO>> getByColumn(
            @PathVariable Long columnId,
            @RequestParam(required = false) String status) {

        List<CardResponseDTO> response = cardService.getCardsByColumnAndStatus(columnId, status)
                .stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(response);
    }

    // UPDATE
    @PutMapping("/{cardId}")
    @PreAuthorize("@securityService.isCardAccessible(#cardId)")
    public ResponseEntity<CardResponseDTO> update(@PathVariable Long cardId, @RequestBody CardRequestDTO dto) {
        Card card = cardService.updateCard(cardId, dto);
        return ResponseEntity.ok(toDTO(card));
    }

    // DELETE
    @DeleteMapping("/{cardId}")
    @PreAuthorize("@securityService.isCardAccessible(#cardId)")
    public ResponseEntity<Void> delete(@PathVariable Long cardId) {
        cardService.deleteCard(cardId);
        return ResponseEntity.noContent().build();
    }

    // MOVE
    @PatchMapping("/{cardId}/move")
    @PreAuthorize("@securityService.isCardAccessible(#cardId)")
    public ResponseEntity<CardResponseDTO> move(
            @PathVariable Long cardId,
            @RequestBody Map<String, Integer> body) {

        Integer columnIdInt = body.get("newColumnId");
        Integer newPosition = body.get("newPosition");

        Card card;

        if (columnIdInt == null) {
            card = cardService.moveCard(cardId, newPosition);
        } else {
            Long newColumnId = columnIdInt.longValue();
            card = cardService.moveCardToColumn(cardId, newColumnId, newPosition);
        }

        return ResponseEntity.ok(toDTO(card));
    }

    @PatchMapping("/{cardId}/assign")
    @PreAuthorize("@securityService.isCardAccessible(#cardId)")
    public ResponseEntity<CardResponseDTO> assignUser(
            @PathVariable Long cardId,
            @RequestBody Map<String, String> body) {

        String dni = body.get("assignedUserDni");

        Card card = cardService.assignUser(cardId, dni);

        return ResponseEntity.ok(toDTO(card));
    }

    // ===============================================================
// MOVE WITHIN SAME COLUMN
// ===============================================================
    @PatchMapping("/{cardId}/reorder")
    public ResponseEntity<CardResponseDTO> reorder(
            @PathVariable Long cardId,
            @RequestBody Map<String, Integer> body) {

        int newPosition = body.getOrDefault("newPosition", 0);

        Card card = cardService.moveCard(cardId, newPosition);

        return ResponseEntity.ok(toDTO(card));
    }

    // ===============================================================
// MOVE TO ANOTHER COLUMN
// ===============================================================
    @PatchMapping("/{cardId}/move-to-column")
    public ResponseEntity<CardResponseDTO> moveToColumn(
            @PathVariable Long cardId,
            @RequestBody Map<String, Object> body) {

        Long newColumnId = Long.valueOf(body.get("newColumnId").toString());
        int newPosition = Integer.parseInt(body.get("newPosition").toString());

        Card card = cardService.moveCardToColumn(cardId, newColumnId, newPosition);

        return ResponseEntity.ok(toDTO(card));
    }

    private CardResponseDTO toDTO(Card c) {
        return CardResponseDTO.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .dueDate(c.getDueDate())
                .finished(c.getFinished())
                .position(c.getPosition())
                .columnId(c.getColumn().getId())
                .assignedUserDni(
                        c.getAssignedUser() != null ? c.getAssignedUser().getDni() : null
                )
                .build();
    }
}
