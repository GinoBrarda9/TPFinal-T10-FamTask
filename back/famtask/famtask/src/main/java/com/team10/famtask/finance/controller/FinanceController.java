package com.team10.famtask.finance.controller;

import com.team10.famtask.finance.dto.MovementDTO;
import com.team10.famtask.finance.entity.Movement;
import com.team10.famtask.finance.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinanceController {

    private final FinanceService financeService;

    @PostMapping("/movement")
    public MovementDTO create(@RequestBody MovementDTO dto) {
        return financeService.createMovement(dto);
    }

    @PutMapping("/movement/{id}")
    public MovementDTO update(@PathVariable Long id, @RequestBody MovementDTO dto) {
        return financeService.updateMovement(id, dto);
    }

    @DeleteMapping("/movement/{id}")
    public void delete(@PathVariable Long id) {
        financeService.deleteMovement(id);
    }

    @GetMapping("/movements")
    public List<MovementDTO> getMyFamilyMovements() {
        return financeService.getMyFamilyMovements();
    }

    @GetMapping("/balance")
    public Double balance() {
        return financeService.getMyFamilyBalance();
    }
}
