package com.team10.famtask.controller.profile;

import com.team10.famtask.entity.profile.EmergencyContact;
import com.team10.famtask.entity.profile.WorkOrStudyInfo;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.profile.EmergencyContactService;
import com.team10.famtask.service.profile.WorkOrStudyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/emergency-contact")

@RequiredArgsConstructor
public class EmergencyContactController {

    private final EmergencyContactService service;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<EmergencyContact> get(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(service.get(email));
    }

    @PostMapping
    public ResponseEntity<EmergencyContact> createOrUpdate(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody EmergencyContact data) {
        String email = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(service.createOrUpdate(email, data));
    }
}
