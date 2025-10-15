package com.team10.famtask.controller;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.service.family.FamilyService;
import com.team10.famtask.service.security.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                    .body(Map.of("error", "Solo los administradores pueden crear una familia."));
        }

        String name = body.get("name");
        Family created = familyService.createFamily(name, currentUser);
        return ResponseEntity.ok(created);
    }

}
