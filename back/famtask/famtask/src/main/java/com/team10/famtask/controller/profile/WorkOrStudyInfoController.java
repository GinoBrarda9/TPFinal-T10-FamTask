package com.team10.famtask.controller.profile;

import com.team10.famtask.entity.profile.WorkOrStudyInfo;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.profile.WorkOrStudyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/work-or-study")
@RequiredArgsConstructor
public class WorkOrStudyInfoController {

    private final WorkOrStudyInfoService service;

    @GetMapping
    public ResponseEntity<WorkOrStudyInfo> get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String dni = (String) auth.getPrincipal();
        return ResponseEntity.ok(service.get(dni));
    }

    @PostMapping
    public ResponseEntity<WorkOrStudyInfo> createOrUpdate(
            @RequestBody WorkOrStudyInfo data) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String dni = (String) auth.getPrincipal();
        return ResponseEntity.ok(service.createOrUpdate(dni, data));
    }
}
