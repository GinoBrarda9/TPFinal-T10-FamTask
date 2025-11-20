package com.team10.famtask.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.service.family.FamilyService;
import com.team10.famtask.service.security.SecurityService;
import com.team10.famtask.util.Helper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FamilyControllerTest {

    private MockMvc mockMvc;
    private FamilyService familyService;
    private SecurityService securityService;
    private ObjectMapper objectMapper;
    private FamilyMemberRepository familyMemberRepository;


    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setup() {
        familyService = mock(FamilyService.class);
        securityService = mock(SecurityService.class);
        objectMapper = new ObjectMapper();
        familyMemberRepository = mock(FamilyMemberRepository.class);
        FamilyController controller = new FamilyController(familyService, securityService, familyMemberRepository);

        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        // Usuarios para los tests
        adminUser = Helper.createUser("40123456", "Admin Test", "admin@test.com", "ADMIN");
        normalUser = Helper.createUser("40123457", "User Test", "user@test.com", "USER");
    }

    // ======================
    // Caso 1: Usuario sin rol ADMIN
    // ======================
    @Test
    void createFamily_forbidden_forNonAdmin() throws Exception {
        // Simular usuario no-admin
        when(securityService.getCurrentUser()).thenReturn(normalUser);

        Map<String, String> request = Map.of("name", "Familia Prohibida");

        mockMvc.perform(post("/api/families")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        // No se debería llamar al service
        verify(familyService, never()).createFamily(any(), any());
    }

    // ======================
    // Caso 2: Usuario ADMIN
    // ======================
    @Test
    void createFamily_success_forAdmin() throws Exception {
        // Simular usuario admin
        when(securityService.getCurrentUser()).thenReturn(adminUser);

        Family createdFamily = Helper.createFamily(1L, "Familia Permitida", new ArrayList<>());
        when(familyService.createFamily("Familia Permitida", adminUser)).thenReturn(createdFamily);

        Map<String, String> request = Map.of("name", "Familia Permitida");

        mockMvc.perform(post("/api/families")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Verificar que se llamó al service con los parámetros correctos
        verify(familyService, times(1)).createFamily("Familia Permitida", adminUser);
    }
}
