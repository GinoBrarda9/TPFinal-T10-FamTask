package com.team10.famtask.google.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GoogleLoginResponse {
    private String jwtToken;
    private String name;
    private String email;
    private String role;
}
