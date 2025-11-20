package com.team10.famtask.controller;

import com.team10.famtask.dto.ErrorResponse;
import com.team10.famtask.dto.family.FamilyDTO;
import com.team10.famtask.dto.family.FamilyMemberDTO;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.service.family.FamilyService;
import com.team10.famtask.service.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/families")
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;
    private final SecurityService securityService;
    private final FamilyMemberRepository familyMemberRepository;

    @PostMapping
    public ResponseEntity<?> createFamily(@RequestBody Map<String, String> body) {
        User currentUser = securityService.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(401)
                    .body(new ErrorResponse("Usuario no autenticado o token inválido."));
        }

        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("El nombre de la familia no puede estar vacío."));
        }

        Family created = familyService.createFamily(name, currentUser);

        List<FamilyMemberDTO> membersDTO = created.getMembers().stream()
                .map(m -> new FamilyMemberDTO(
                        m.getUser().getDni(),
                        m.getUser().getName(),
                        m.getUser().getEmail(),
                        m.getRole()))
                .toList();

        FamilyDTO dto = new FamilyDTO(created.getId(), created.getName(), membersDTO);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{familyId}/members")
    @PreAuthorize("@securityService.isMemberOfFamily(#familyId, authentication)")
    public ResponseEntity<List<FamilyMemberDTO>> getMembers(@PathVariable Long familyId) {

        List<FamilyMemberDTO> response = familyMemberRepository
                .findById_FamilyId(familyId)
                .stream()
                .map(m -> FamilyMemberDTO.builder()
                        .dni(m.getUser().getDni())
                        .name(m.getUser().getName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole())
                        .build()
                )
                .toList();

        return ResponseEntity.ok(response);
    }


}
