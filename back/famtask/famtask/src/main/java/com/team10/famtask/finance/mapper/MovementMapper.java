package com.team10.famtask.finance.mapper;

import com.team10.famtask.finance.dto.MovementDTO;
import com.team10.famtask.finance.entity.Movement;

public class MovementMapper {


    public static MovementDTO toDTO(Movement m) {
        return MovementDTO.builder()
                .id(m.getId())
                .amount(m.getAmount())
                .description(m.getDescription())
                .category(m.getCategory())
                .type(m.getType())
                .familyId(m.getFamily() != null ? m.getFamily().getId() : null)
                .createdAt(m.getCreatedAt() != null ? m.getCreatedAt().toString() : null)
                .build();
    }
}
