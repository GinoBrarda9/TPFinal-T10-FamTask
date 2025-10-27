package com.team10.famtask.service.security;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepo;

    @Mock
    private JwtUtil jwtUtil;

    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepo, passwordEncoder, jwtUtil);
    }

    @Test
    void login_exitoso_retornaToken() {
        // Arrange
        String rawPassword = "Password@123";
        String hashed = passwordEncoder.encode(rawPassword);

        User user = User.builder()
                .dni("12345678")
                .email("ana@example.com")
                .passwordHash(hashed)
                .role("USER")
                .build();

        when(userRepo.findByEmail("ana@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(any(User.class))).thenReturn("fake-jwt-token");

        // Act
        String token = authService.login("ana@example.com", rawPassword);

        // Assert
        assertEquals("fake-jwt-token", token);
        verify(jwtUtil, times(1)).generateToken(user);
    }

    @Test
    void login_usuarioNoExiste_lanzaExcepcion() {
        when(userRepo.findByEmail("noexiste@example.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.login("noexiste@example.com", "Password@123")
        );

        assertEquals("Usuario no encontrado", ex.getMessage());
    }

    @Test
    void login_contraseniaIncorrecta_lanzaExcepcion() {
        String hashed = passwordEncoder.encode("Password@123");
        User user = User.builder()
                .email("ana@example.com")
                .passwordHash(hashed)
                .role("USER")
                .build();

        when(userRepo.findByEmail("ana@example.com")).thenReturn(Optional.of(user));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                authService.login("ana@example.com", "WrongPass")
        );

        assertEquals("Contraseña incorrecta", ex.getMessage());
    }
}
