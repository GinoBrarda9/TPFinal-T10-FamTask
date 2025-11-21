package com.team10.famtask.controller.profile;

import com.team10.famtask.entity.profile.EmergencyContact;
import com.team10.famtask.entity.profile.WorkOrStudyInfo;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.profile.EmergencyContactService;
import com.team10.famtask.service.profile.WorkOrStudyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/emergency-contact")
@RequiredArgsConstructor
public class EmergencyContactController {

    private final EmergencyContactService service;

    @GetMapping
    public ResponseEntity<EmergencyContact> get() {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String dni = (String) auth.getPrincipal();
        return ResponseEntity.ok(service.get(dni));
    }

    @PostMapping
    public ResponseEntity<EmergencyContact> createOrUpdate(
            @RequestBody EmergencyContact data) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String dni = (String) auth.getPrincipal();
        return ResponseEntity.ok(service.createOrUpdate(dni, data));
    }
}
