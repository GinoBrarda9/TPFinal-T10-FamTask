package com.team10.famtask.finance.transfer.dto;

import com.team10.famtask.finance.entity.MovementCategory;
import com.team10.famtask.finance.transfer.entity.TransferStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TransferResponseDTO {
    private Long id;
    private Double amount;
    private String description;
    private MovementCategory category;
    private TransferStatus status;
    private String mpInitPoint;
    private LocalDateTime createdAt;

    private String fromUserDni;
    private String toUserDni;
}
