package com.team10.famtask.controller;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest request) {

        // Validar si ya existe el DNI
        if (userRepository.existsById(request.getDni())) {
            return ResponseEntity.badRequest().body("El DNI ya está registrado.");
        }

        // Validar si ya existe el email
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("El email ya está registrado.");
        }

        // Validaciones de formato
        if (!isValidEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email inválido.");
        }
        if (!isValidPassword(request.getPassword())) {
            return ResponseEntity.badRequest().body(
                    "La contraseña debe tener al menos 8 caracteres, " +
                            "una mayúscula, una minúscula, un número y un carácter especial."
            );
        }

        // Crear usuario con contraseña hasheada
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .dni(request.getDni())
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .role("member")
                .build();

        userRepository.save(user);
        return ResponseEntity.ok("Usuario registrado con éxito.");
    }

    // DTO para recibir la request
    @Data
    public static class RegisterRequest {
        private String dni;
        private String name;
        private String email;
        private String password;
    }

    // Validación de email
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
        return Pattern.compile(emailRegex).matcher(email).matches();
    }

    // Validación de contraseña
    private boolean isValidPassword(String password) {
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return Pattern.compile(passwordRegex).matcher(password).matches();
    }
}
