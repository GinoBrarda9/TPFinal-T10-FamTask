package com.team10.famtask.finance.dto;

import com.team10.famtask.finance.entity.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovementDTO {

    private Long id;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor a 0")
    private Double amount;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 120, message = "La descripción no puede superar los 120 caracteres")
    private String description;

    @NotNull(message = "La categoría es obligatoria")
    private MovementCategory category;

    @NotNull(message = "El tipo es obligatorio (INCOME o EXPENSE)")
    private MovementType type;

    private Long familyId;

    private String createdAt;
}
