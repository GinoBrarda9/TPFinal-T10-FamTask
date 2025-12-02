package com.team10.famtask.reports.kanban.dto;

import com.team10.famtask.board.entity.CardStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CardSimpleDTO {
    private Long id;
    private String title;
    private String assignedUserDni;
    private CardStatus status;
    private LocalDateTime dueDate;
}
