package com.team10.famtask.controller.profile;

import com.team10.famtask.entity.profile.MedicalInfo;
import com.team10.famtask.entity.profile.WorkOrStudyInfo;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.profile.MedicalInfoService;
import com.team10.famtask.service.profile.WorkOrStudyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/medical-info")
@RequiredArgsConstructor


public class MedicalInfoController {

    private final MedicalInfoService service;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<MedicalInfo> get(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(service.get(email));
    }

    @PostMapping
    public ResponseEntity<MedicalInfo> createOrUpdate(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody MedicalInfo data) {
        String email = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(service.createOrUpdate(email, data));
    }
}
