package com.team10.famtask.controller.profile;

import com.team10.famtask.dto.profile.ContactInfoDTO;
import com.team10.famtask.entity.profile.ContactInfo;
import com.team10.famtask.entity.profile.WorkOrStudyInfo;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.profile.ContactInfoService;
import com.team10.famtask.service.profile.WorkOrStudyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/contact-info")
@RequiredArgsConstructor
public class ContactInfoController {

    private final ContactInfoService service;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<ContactInfoDTO> get(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(service.get(email));
    }

    @PostMapping
    public ResponseEntity<ContactInfoDTO> createOrUpdate(@RequestBody ContactInfo data) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String dni = (String) auth.getPrincipal(); // porque pusimos dni como principal

        return ResponseEntity.ok(service.createOrUpdateByDni(dni, data));
    }
}
