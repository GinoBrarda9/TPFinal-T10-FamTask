package com.team10.famtask.controller;

import com.team10.famtask.dto.HomePageResponseDTO;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.home.HomePageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/homepage")
public class HomePageController {

    private final JwtService jwtService;
    private final HomePageService homePageService; // el tuyo

    public HomePageController(JwtService jwtService, HomePageService homePageService) {
        this.jwtService = jwtService;
        this.homePageService = homePageService;
    }

    @GetMapping
    public ResponseEntity<HomePageResponseDTO> getHomePage(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String dni = jwtService.extractDni(token); // 👈 DNI del JWT
        HomePageResponseDTO dto = homePageService.getHomePageData(dni); // el service debe esperar DNI
        return ResponseEntity.ok(dto);
    }
}

