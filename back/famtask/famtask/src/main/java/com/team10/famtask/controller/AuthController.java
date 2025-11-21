package com.team10.famtask.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.google.config.GoogleCredentialsConfig;
import com.team10.famtask.google.dto.GoogleLoginResponse;
import com.team10.famtask.google.service.GoogleOAuthService;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleOAuthService googleOAuthService;
    private final GoogleCredentialsConfig googleConfig;

    public AuthController(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder, GoogleOAuthService googleOAuthService, GoogleCredentialsConfig googleConfig){
      this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.googleOAuthService = googleOAuthService;
        this.googleConfig = googleConfig;
    }

    // ====================
    // Registro de usuario
    // ====================
    @PostMapping("/register")

    public ResponseEntity<Map<String, String>> registerUser(@RequestBody RegisterRequest request) {

        if (userRepository.existsById(request.getDni())) {
            return ResponseEntity.badRequest().body(Map.of("error", "El DNI ya está registrado."));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "El email ya está registrado."));
        }

        if (!isValidEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email inválido."));
        }

        if (!isValidPassword(request.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error",
                    "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
            ));
        }
        System.out.println("RegisterRequest recibido: " + request);
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = User.builder()
                .dni(request.getDni())
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(hashedPassword)
                .role("user")
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Usuario registrado con éxito."));
    }

    // ====================
    // Login
    // ====================
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas."));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas."));
        }

        String token = jwtService.generateToken(user.getEmail(), user.getDni(), user.getRole(), user.getName());

        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/google/login")
    public ResponseEntity<Map<String, String>> googleLogin() {
        String url = googleOAuthService.getGoogleAuthorizationUrl();
        return ResponseEntity.ok(Map.of("url", url));
    }

    @GetMapping("/auth/google/callback")
    public ResponseEntity<?> googleCallback(
            @RequestParam String code,
            @RequestParam String state
    ) {
        String dni = state.replace("dni=", "");
        User user = userRepository.findById(dni)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        try {
            GoogleTokenResponse tokenResponse =
                    new GoogleAuthorizationCodeTokenRequest(
                            GoogleNetHttpTransport.newTrustedTransport(),
                            GsonFactory.getDefaultInstance(),
                            "https://oauth2.googleapis.com/token",
                            googleConfig.getClientId(),
                            googleConfig.getClientSecret(),
                            code,
                            googleConfig.getRedirectUri()
                    ).execute();

            // Guardar tokens…

            // --- Guardar tokens ---
            user.setGoogleAccessToken(tokenResponse.getAccessToken());
            user.setGoogleRefreshToken(tokenResponse.getRefreshToken());
            user.setGoogleLinked(true);
            user.setGoogleTokenUpdatedAt(LocalDateTime.now());

            userRepository.save(user);

            // Redirigir de vuelta al front
            return ResponseEntity.ok("Cuenta de Google vinculada nuevamente");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al vincular Google: " + e.getMessage());
        }
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
