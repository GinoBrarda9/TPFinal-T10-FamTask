package com.team10.famtask.controller;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @InjectMocks
    private AuthController authController;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    // =====================
    // Registro
    // =====================
    @Test
    void registerUser_success() {
        AuthController.RegisterRequest req = new AuthController.RegisterRequest();
        req.setDni("12345678");
        req.setName("Ana");
        req.setEmail("ana@test.com");
        req.setPassword("Password1!");

        when(userRepository.existsById("12345678")).thenReturn(false);
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1!")).thenReturn("hashed-pass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        ResponseEntity<Map<String, String>> response = authController.registerUser(req);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Usuario registrado con éxito.", response.getBody().get("message"));
    }

    @Test
    void registerUser_existingDni() {
        AuthController.RegisterRequest req = new AuthController.RegisterRequest();
        req.setDni("12345678");
        req.setEmail("ana@test.com");

        when(userRepository.existsById("12345678")).thenReturn(true);

        ResponseEntity<Map<String, String>> response = authController.registerUser(req);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("El DNI ya está registrado.", response.getBody().get("error"));
    }

    @Test
    void registerUser_existingEmail() {
        AuthController.RegisterRequest req = new AuthController.RegisterRequest();
        req.setDni("87654321");
        req.setEmail("ana@test.com");

        when(userRepository.existsById("87654321")).thenReturn(false);
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(true);

        ResponseEntity<Map<String, String>> response = authController.registerUser(req);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("El email ya está registrado.", response.getBody().get("error"));
    }

    // =====================
    // Login
    // =====================
    @Test
    void login_success() {
        AuthController.LoginRequest req = new AuthController.LoginRequest();
        req.setEmail("ana@test.com");
        req.setPassword("Password1!");

        User existingUser = User.builder()
                .dni("12345678")      // <--- agregar DNI
                .email("ana@test.com")
                .passwordHash("hashed-pass")
                .role("member")
                .name("Ana")
                .build();

        when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("Password1!", "hashed-pass")).thenReturn(true);

        // usar matchers en vez de valores literales
        when(jwtService.generateToken(
                anyString(),
                eq("ana@test.com"),
                eq("member"),
                eq("Ana")
        )).thenReturn("fake-jwt-token");

        ResponseEntity<Map<String, String>> response = authController.login(req);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("fake-jwt-token", response.getBody().get("token"));
    }


    @Test
    void login_invalidPassword() {
        AuthController.LoginRequest req = new AuthController.LoginRequest();
        req.setEmail("ana@test.com");
        req.setPassword("WrongPass");

        User user = User.builder()
                .email("ana@test.com")
                .passwordHash("hashed-pass")
                .role("member")
                .name("Ana")
                .build();

        when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass", "hashed-pass")).thenReturn(false);

        ResponseEntity<Map<String, String>> response = authController.login(req);

        assertEquals(401, response.getStatusCodeValue());
        assertEquals("Credenciales inválidas.", response.getBody().get("error"));
    }

    @Test
    void login_userNotFound() {
        AuthController.LoginRequest req = new AuthController.LoginRequest();
        req.setEmail("unknown@test.com");
        req.setPassword("Password1!");

        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        ResponseEntity<Map<String, String>> response = authController.login(req);

        assertEquals(401, response.getStatusCodeValue());
        assertEquals("Credenciales inválidas.", response.getBody().get("error"));
    }
}
