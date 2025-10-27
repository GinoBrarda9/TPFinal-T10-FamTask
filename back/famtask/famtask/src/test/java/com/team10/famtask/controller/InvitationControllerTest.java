package com.team10.famtask.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team10.famtask.dto.InvitationRequestDTO;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.Invitation;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.service.family.InvitationService;
import com.team10.famtask.service.security.SecurityService;
import com.team10.famtask.util.Helper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InvitationController.class)
class InvitationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InvitationService invitationService;

    @MockBean
    private SecurityService securityService;

    @Autowired
    private ObjectMapper objectMapper;

    private User adminUser;
    private User invitedUser;
    private Family family;
    private Invitation invitation;

    @BeforeEach
    void setUp() {
        adminUser = Helper.createUser("40123456", "Juan Pérez", "juan.admin@test.com", "ADMIN");
        invitedUser = Helper.createUser("40222222", "María López", "maria.user@test.com", "USER");
        family = Family.builder().id(1L).name("Familia Pérez").build();

        invitation = Invitation.builder()
                .id(1L)
                .family(family)
                .invitedUser(invitedUser)
                .status("PENDING")
                .role("USER")
                .build();
    }

    // ======================
    // Crear invitación
    // ======================
    @Test
    void testCreateInvitation_Success() throws Exception {
        InvitationRequestDTO request = new InvitationRequestDTO(family.getId(), invitedUser.getDni(), "USER");

        when(securityService.getCurrentUser()).thenReturn(adminUser);
        when(invitationService.createInvitation(any(User.class), anyLong(), anyString(), anyString()))
                .thenReturn(invitation);

        mockMvc.perform(post("/api/invitations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.invitedUserName").value(invitedUser.getName()))
                .andExpect(jsonPath("$.invitedUserEmail").value(invitedUser.getEmail()))
                .andExpect(jsonPath("$.familyName").value(family.getName()));

        verify(invitationService, times(1))
                .createInvitation(any(User.class), anyLong(), anyString(), anyString());
    }

    // ======================
    // Aceptar invitación
    // ======================
    @Test
    void testRespondInvitation_Accepted() throws Exception {
        invitation.setStatus("PENDING");
        when(securityService.getCurrentUser()).thenReturn(invitedUser);
        when(invitationService.respondInvitation(eq(1L), eq(true), any(User.class)))
                .thenAnswer(inv -> {
                    invitation.setStatus("ACCEPTED");
                    return invitation;
                });

        mockMvc.perform(post("/api/invitations/1/respond")
                        .param("accept", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.invitedUserName").value(invitedUser.getName()));

        verify(invitationService, times(1))
                .respondInvitation(1L, true, invitedUser);
    }

    // ======================
    // Rechazar invitación
    // ======================
    @Test
    void testRespondInvitation_Rejected() throws Exception {
        invitation.setStatus("PENDING");
        when(securityService.getCurrentUser()).thenReturn(invitedUser);
        when(invitationService.respondInvitation(eq(2L), eq(false), any(User.class)))
                .thenAnswer(inv -> {
                    invitation.setStatus("REJECTED");
                    return invitation;
                });

        mockMvc.perform(post("/api/invitations/2/respond")
                        .param("accept", "false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.invitedUserName").value(invitedUser.getName()));

        verify(invitationService, times(1))
                .respondInvitation(2L, false, invitedUser);
    }

    // ======================
    // Invitaciones pendientes
    // ======================
    @Test
    void testGetPendingInvitations() throws Exception {
        when(securityService.getCurrentUser()).thenReturn(invitedUser);
        when(invitationService.getPendingInvitations(invitedUser))
                .thenReturn(List.of(invitation));

        mockMvc.perform(get("/api/invitations/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].role").value("USER"))
                .andExpect(jsonPath("$[0].invitedUserName").value(invitedUser.getName()));

        verify(invitationService, times(1)).getPendingInvitations(invitedUser);
    }
}
