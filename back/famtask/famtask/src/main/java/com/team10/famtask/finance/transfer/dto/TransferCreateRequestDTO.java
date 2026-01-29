package com.team10.famtask.finance.transfer.dto;

import com.team10.famtask.finance.entity.MovementCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TransferCreateRequestDTO {

    @NotNull
    @Positive
    private Double amount;

    @NotBlank
    private String description;

    @NotNull
    private MovementCategory category;

    /**
     * DNI del miembro destino (es lo que el frontend ya maneja).
     */
    @NotBlank
    private String toUserDni;
}
