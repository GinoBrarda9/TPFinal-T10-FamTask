package com.team10.famtask.controller.profile;

import com.team10.famtask.entity.profile.ContactInfo;
import com.team10.famtask.entity.profile.WorkOrStudyInfo;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.profile.ContactInfoService;
import com.team10.famtask.service.profile.WorkOrStudyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/contact-info")
@RequiredArgsConstructor
public class ContactInfoController {

    private final ContactInfoService service;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<ContactInfo> get(@RequestHeader("Authorization") String authHeader) {
        String email = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(service.get(email));
    }

    @PostMapping
    public ResponseEntity<ContactInfo> createOrUpdate(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ContactInfo data) {
        String email = jwtService.extractUsername(authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok(service.createOrUpdate(email, data));
    }
}
