package com.team10.famtask.finance.transfer.controller;

import com.team10.famtask.finance.transfer.dto.TransferCreateRequestDTO;
import com.team10.famtask.finance.transfer.dto.TransferResponseDTO;
import com.team10.famtask.finance.transfer.service.FamilyTransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/transfers")
@RequiredArgsConstructor
public class FamilyTransferController {

    private final FamilyTransferService transferService;

    @GetMapping
    public List<TransferResponseDTO> list() {
        return transferService.listMyFamilyTransfers();
    }

    @PostMapping
    public TransferResponseDTO create(@Valid @RequestBody TransferCreateRequestDTO dto) {
        return transferService.createTransfer(dto);
    }

    /**
     * DEMO A: botón manual para marcar como pagada (sin webhook).
     */
    @PostMapping("/{id}/mark-paid")
    public TransferResponseDTO markPaid(@PathVariable Long id) {
        return transferService.markPaid(id);
    }
}
