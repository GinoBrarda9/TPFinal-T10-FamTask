package com.team10.famtask.dto.family;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FamilyMemberDTO {
    private String dni;
    private String name;
    private String email;
    private String role;
    private String phone;
}

