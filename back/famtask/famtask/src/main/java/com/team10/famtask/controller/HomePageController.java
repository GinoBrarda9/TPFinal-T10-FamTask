package com.team10.famtask.controller;

import com.team10.famtask.dto.HomePageResponseDTO;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.home.HomePageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/homepage")
@RequiredArgsConstructor
public class HomePageController {

    private final HomePageService homePageService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<HomePageResponseDTO> getHomePage(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String userEmail = jwtService.extractUsername(token);

        HomePageResponseDTO response = homePageService.getHomePageData(userEmail);
        return ResponseEntity.ok(response);
    }
}
