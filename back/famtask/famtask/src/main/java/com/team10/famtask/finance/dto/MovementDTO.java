package com.team10.famtask.finance.dto;

import com.team10.famtask.finance.entity.MovementCategory;
import com.team10.famtask.finance.entity.MovementType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementDTO {

    private Long id;
    private Double amount;
    private String description;
    private MovementCategory category;
    private MovementType type;
    private Long familyId;
    private String createdAt;
}