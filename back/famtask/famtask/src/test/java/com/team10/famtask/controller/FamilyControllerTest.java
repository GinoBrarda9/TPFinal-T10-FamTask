package com.team10.famtask.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.security.JwtService;
import com.team10.famtask.service.family.FamilyService;
import com.team10.famtask.service.security.SecurityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FamilyController.class)
@AutoConfigureMockMvc(addFilters = false) // evita cargar seguridad real
class FamilyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;


    @MockBean
    private FamilyService familyService;

    @MockBean
    private SecurityService securityService;

    private ObjectMapper objectMapper;

    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setup() {
        objectMapper = new ObjectMapper();

        adminUser = new User();
        adminUser.setDni("11111111");
        adminUser.setEmail("admin@test.com");
        adminUser.setRole("ADMIN");

        normalUser = new User();
        normalUser.setDni("22222222");
        normalUser.setEmail("user@test.com");
        normalUser.setRole("USER");
    }

    @Test
    void createFamily_success_forAdmin() throws Exception {
        // Preparar la request
        Family familyRequest = new Family();
        familyRequest.setName("Familia Pérez");

        // Objeto que el service devolverá
        Family createdFamily = new Family();
        createdFamily.setId(1L);
        createdFamily.setName("Familia Pérez");

        // Mockear dependencias
        when(securityService.getCurrentUser()).thenReturn(adminUser);
        when(familyService.createFamily(any(String.class), eq(adminUser))).thenReturn(createdFamily);

        // Ejecutar la llamada al endpoint
        mockMvc.perform(post("/api/families")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(familyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Familia Pérez"));
    }

    @Test
    void createFamily_forbidden_forNonAdmin() throws Exception {
        Family familyRequest = new Family();
        familyRequest.setName("Familia López");

        when(securityService.getCurrentUser()).thenReturn(normalUser);

        mockMvc.perform(post("/api/families")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(familyRequest)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Solo los administradores pueden crear una familia."));

        verify(familyService, never()).createFamily(String.valueOf(ArgumentMatchers.any(Family.class)), any(User.class));
    }
}
