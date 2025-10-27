package com.team10.famtask.dto;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationSimpleDTO {

    private Long id;
    private String status;
    private String role;
    private LocalDateTime createdAt;

    private User invitedUser;  // Incluye nombre, email, dni
    private Family family;     // Permite mostrar info básica de la familia
}
