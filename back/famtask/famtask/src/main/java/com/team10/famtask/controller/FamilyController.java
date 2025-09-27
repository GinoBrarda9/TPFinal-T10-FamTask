package com.team10.famtask.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FamilyController {

    @GetMapping("/health")
    public String healthCheck() {
        return "ok";
    }
}
