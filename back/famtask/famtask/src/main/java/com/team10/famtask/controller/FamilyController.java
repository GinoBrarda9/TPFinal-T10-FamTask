package com.team10.famtask.controller;

import com.team10.famtask.dto.ErrorResponse;
import com.team10.famtask.dto.FamilyDTO;
import com.team10.famtask.dto.FamilyMemberDTO;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.service.family.FamilyService;
import com.team10.famtask.service.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/families")
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;
    private final SecurityService securityService;

    @PostMapping
    public ResponseEntity<?> createFamily(@RequestBody Map<String, String> body) {
        User currentUser = securityService.getCurrentUser();

        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse("Solo los administradores pueden crear una familia."));
        }

        String name = body.get("name");
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


}
