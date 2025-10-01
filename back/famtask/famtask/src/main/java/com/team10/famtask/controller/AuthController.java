package com.team10.famtask.controller;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // ====================
    // Registro de usuario
    // ====================
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody RegisterRequest request) {

        if (userRepository.existsById(request.getDni())) {
            return ResponseEntity.badRequest().body("El DNI ya está registrado.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("El email ya está registrado.");
        }

        if (!isValidEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email inválido.");
        }
        if (!isValidPassword(request.getPassword())) {
            return ResponseEntity.badRequest().body(
                    "La contraseña debe tener al menos 8 caracteres, " +
                            "una mayúscula, una minúscula, un número y un carácter especial."
            );
        }

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

    // ====================
    // Login
    // ====================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Credenciales inválidas.");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Credenciales inválidas.");
        }

        // ✅ Generar token real con JwtService
        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(new LoginResponse(token));
    }

    // ====================
    // DTOs
    // ====================
    @Data
    public static class RegisterRequest {
        private String dni;
        private String name;
        private String email;
        private String password;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class LoginResponse {
        private final String token;
    }

    // ====================
    // Validaciones
    // ====================
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
        return Pattern.compile(emailRegex).matcher(email).matches();
    }

    private boolean isValidPassword(String password) {
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$";
        return Pattern.compile(passwordRegex).matcher(password).matches();
    }
}
