package com.team10.famtask.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.family.UserService;
import com.team10.famtask.service.security.SecurityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {AuthController.class, UserController.class})
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class IntegrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserService userService;

    @MockBean
    private SecurityService securityService;

    @MockBean
    private BCryptPasswordEncoder passwordEncoder;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();
    }

    // =======================
    // AuthController - Register
    // =======================
    @Test
    void registerUser_success() throws Exception {
        AuthController.RegisterRequest request = new AuthController.RegisterRequest();
        request.setDni("12345678");
        request.setName("Ana");
        request.setEmail("ana@test.com");
        request.setPassword("Password1!");

        when(userRepository.existsById("12345678")).thenReturn(false);
        when(userRepository.existsByEmail("ana@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1!")).thenReturn("hashed-pass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Usuario registrado con éxito."));
    }

    @Test
    void registerUser_existingDni() throws Exception {
        AuthController.RegisterRequest request = new AuthController.RegisterRequest();
        request.setDni("12345678");
        request.setEmail("ana@test.com");

        when(userRepository.existsById("12345678")).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("El DNI ya está registrado."));
    }

    // =======================
    // AuthController - Login
    // =======================
    @Test
    void login_success() throws Exception {
        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.setEmail("ana@test.com");
        request.setPassword("Password1!");

        User user = User.builder()
                .email("ana@test.com")
                .passwordHash("hashed-pass")
                .role("member")
                .name("Ana")
                .build();

        when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password1!", "hashed-pass")).thenReturn(true);
        when(jwtService.generateToken("ana@test.com", "member", "Ana")).thenReturn("fake-jwt-token");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("fake-jwt-token"));
    }

    @Test
    void login_invalidPassword() throws Exception {
        AuthController.LoginRequest request = new AuthController.LoginRequest();
        request.setEmail("ana@test.com");
        request.setPassword("WrongPass");

        User user = User.builder()
                .email("ana@test.com")
                .passwordHash("hashed-pass")
                .role("member")
                .name("Ana")
                .build();

        when(userRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPass", "hashed-pass")).thenReturn(false);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Credenciales inválidas."));
    }

    // =======================
    // UserController - Get User by DNI
    // =======================
    @Test
    void getUserByDni_success() throws Exception {
        User user = new User();
        user.setDni("12345678");
        user.setEmail("ana@test.com");

        when(userService.getUserByDni("12345678")).thenReturn(Optional.of(user));
        when(securityService.isOwner("12345678")).thenReturn(true);

        mockMvc.perform(get("/api/users/12345678")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dni").value("12345678"))
                .andExpect(jsonPath("$.email").value("ana@test.com"));
    }

    @Test
    void getUserByDni_notFound() throws Exception {
        when(userService.getUserByDni("99999999")).thenReturn(Optional.empty());
        when(securityService.isOwner("99999999")).thenReturn(false);

        mockMvc.perform(get("/api/users/99999999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    // =======================
    // UserController - Create User
    // =======================
    @Test
    void createUser_success() throws Exception {
        User user = new User();
        user.setDni("12345678");
        user.setEmail("ana@test.com");

        when(userService.createUser(any(User.class))).thenReturn(user);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dni").value("12345678"))
                .andExpect(jsonPath("$.email").value("ana@test.com"));
    }

    // =======================
    // UserController - Delete User
    // =======================
    @Test
    void deleteUser_success() throws Exception {
        when(userService.deleteUser("12345678")).thenReturn(true);

        mockMvc.perform(delete("/api/users/12345678"))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void deleteUser_notFound() throws Exception {
        when(userService.deleteUser("99999999")).thenReturn(false);

        mockMvc.perform(delete("/api/users/99999999"))
                .andExpect(status().isNotFound());
    }

    // =======================
    // UserController - Update User
    // =======================
    @Test
    void updateUser_success() throws Exception {
        User updatedUser = new User();
        updatedUser.setName("Nuevo Nombre");

        when(userService.updateUser(eq("12345678"), any(User.class)))
                .thenReturn(Optional.of(updatedUser));
        when(securityService.isOwner("12345678")).thenReturn(true);

        mockMvc.perform(put("/api/users/12345678")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nuevo Nombre"));
    }
}
