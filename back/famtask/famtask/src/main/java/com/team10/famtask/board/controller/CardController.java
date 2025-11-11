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

    @PostMapping("/column/{columnId}")
    @PreAuthorize("@securityService.isColumnAccessible(#columnId, authentication)")
    public ResponseEntity<CardResponseDTO> create(
            @PathVariable Long columnId,
            @RequestBody CardRequestDTO dto) {

        Card card = cardService.createCard(columnId, dto);

        return ResponseEntity.ok(CardResponseDTO.builder()
                .id(card.getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .dueDate(card.getDueDate())
                .finished(card.getFinished())
                .position(card.getPosition())
                .columnId(columnId)
                .build());
    }

    @GetMapping("/column/{columnId}")
    @PreAuthorize("@securityService.isColumnAccessible(#columnId, authentication)")
    public ResponseEntity<List<CardResponseDTO>> getByColumn(@PathVariable Long columnId) {
        List<CardResponseDTO> response = cardService.getCardsByColumn(columnId)
                .stream()
                .map(c -> CardResponseDTO.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .description(c.getDescription())
                        .dueDate(c.getDueDate())
                        .finished(c.getFinished())
                        .position(c.getPosition())
                        .columnId(columnId)
                        .build())
                .toList();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{cardId}")
    @PreAuthorize("@securityService.isCardAccessible(#cardId, authentication)")
    public ResponseEntity<CardResponseDTO> update(@PathVariable Long cardId, @RequestBody CardRequestDTO dto) {
        Card card = cardService.updateCard(cardId, dto);
        return ResponseEntity.ok(CardResponseDTO.builder()
                .id(card.getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .dueDate(card.getDueDate())
                .finished(card.getFinished())
                .position(card.getPosition())
                .columnId(card.getColumn().getId())
                .build());
    }

    @DeleteMapping("/{cardId}")
    @PreAuthorize("@securityService.isCardAccessible(#cardId, authentication)")
    public ResponseEntity<Void> delete(@PathVariable Long cardId) {
        cardService.deleteCard(cardId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{cardId}/move")
    @PreAuthorize("@securityService.isCardAccessible(#cardId, authentication)")
    public ResponseEntity<CardResponseDTO> move(
            @PathVariable Long cardId,
            @RequestBody Map<String, Integer> body) {

        int newPosition = body.get("newPosition");
        Card card = cardService.moveCard(cardId, newPosition);

        return ResponseEntity.ok(CardResponseDTO.builder()
                .id(card.getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .dueDate(card.getDueDate())
                .finished(card.getFinished())
                .position(card.getPosition())
                .columnId(card.getColumn().getId())
                .build());
    }

}
