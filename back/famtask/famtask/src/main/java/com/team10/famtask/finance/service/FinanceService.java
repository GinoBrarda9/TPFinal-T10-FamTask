package com.team10.famtask.finance.service;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.finance.dto.MovementDTO;
import com.team10.famtask.finance.entity.Movement;
import com.team10.famtask.finance.entity.MovementCategory;
import com.team10.famtask.finance.entity.MovementType;
import com.team10.famtask.finance.mapper.MovementMapper;
import com.team10.famtask.finance.repository.MovementRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import com.team10.famtask.service.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final MovementRepository movementRepository;
    private final FamilyRepository familyRepository;
    private final SecurityService securityService;

    // -------------------------
    // Helper: familia del logueado
    // -------------------------
    private Family getLoggedUserFamily() {
        String dni = securityService.getCurrentUser().getDni();
        // usa el mismo repositorio/método que ya tenés estable en FamTask
        return familyRepository.findByMemberFetchAll(dni)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "No pertenecés a ninguna familia"
                ));
    }

    // -------------------------
    // CREATE (sin familyId del front)
    // -------------------------
    public MovementDTO createMovement(MovementDTO dto) {
        Family family = getLoggedUserFamily();

        Movement movement = Movement.builder()
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .type(dto.getType())
                .createdAt(LocalDateTime.now())
                .family(family)
                .build();

        return MovementMapper.toDTO(movementRepository.save(movement));
    }

    // -------------------------
    // UPDATE (solo si el mov. es de mi familia)
    // -------------------------
    public MovementDTO updateMovement(Long id, MovementDTO dto) {
        Family family = getLoggedUserFamily();

        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Movimiento no encontrado"
                ));

        if (!movement.getFamily().getId().equals(family.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tenés permiso para modificar este movimiento"
            );
        }

        movement.setAmount(dto.getAmount());
        movement.setDescription(dto.getDescription());
        movement.setCategory(dto.getCategory());
        movement.setType(dto.getType());

        return MovementMapper.toDTO(movementRepository.save(movement));
    }

    // -------------------------
    // DELETE (solo si es de mi familia)
    // -------------------------
    public void deleteMovement(Long id) {
        Family family = getLoggedUserFamily();

        Movement movement = movementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Movimiento no encontrado"
                ));

        if (!movement.getFamily().getId().equals(family.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tenés permiso para eliminar este movimiento"
            );
        }

        movementRepository.deleteById(id);
    }

    // -------------------------
    // GET movements (mis movimientos)
    // -------------------------
    public List<MovementDTO> getMyFamilyMovements() {
        Family family = getLoggedUserFamily();

        return movementRepository.findByFamily(family)
                .stream()
                .map(MovementMapper::toDTO)
                .collect(Collectors.toList());
    }

    // -------------------------
    // GET balance (mi familia)
    // -------------------------
    public Double getMyFamilyBalance() {
        return getMyFamilyMovements().stream()
                .mapToDouble(m -> m.getType() == MovementType.INCOME
                        ? m.getAmount()
                        : -m.getAmount())
                .sum();
    }
}

