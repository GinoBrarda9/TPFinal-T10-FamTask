package com.team10.famtask.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.Invitation;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.service.family.FamilyService;
import com.team10.famtask.service.family.InvitationService;
import com.team10.famtask.service.security.SecurityService;
import com.team10.famtask.util.Helper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class InvitationControllerTest {

    private MockMvc mockMvc;
    private InvitationService invitationService;
    private FamilyService familyService;
    private SecurityService securityService;
    private ObjectMapper objectMapper;

    private User testUser;
    private Family testFamily;

    @BeforeEach
    void setup() {
        invitationService = mock(InvitationService.class);
        familyService = mock(FamilyService.class);
        securityService = mock(SecurityService.class);
        objectMapper = new ObjectMapper();

        testUser = Helper.createUser("40123456", "Juan Perez", "juan@test.com");
        testFamily = Helper.createFamily(1L, "Familia de prueba", new ArrayList<>());

        InvitationController controller = new InvitationController(invitationService, familyService, securityService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testInviteUserReturnsDto() throws Exception {
        InvitationController.InviteRequest request = new InvitationController.InviteRequest();
        request.setFamilyId(testFamily.getId());
        request.setInvitedUserDni(testUser.getDni());
        request.setRole("member");

        Invitation invitation = new Invitation();
        invitation.setId(10L);
        invitation.setRole("member");
        invitation.setInvitedUser(testUser);
        invitation.setStatus("PENDING");
        invitation.setFamily(testFamily);

        when(familyService.getFamilyById(testFamily.getId())).thenReturn(testFamily);
        when(securityService.getUserByDni(testUser.getDni())).thenReturn(testUser);
        when(invitationService.createInvitation(any(), any(), any())).thenReturn(invitation);

        mockMvc.perform(post("/api/invitations/invite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.role").value("member"))
                .andExpect(jsonPath("$.invitedUser.dni").value(testUser.getDni()))
                .andExpect(jsonPath("$.invitedUser.name").value(testUser.getName()));
    }

    @Test
    void testRespondInvitationAcceptUpdatesStatus() throws Exception {
        Invitation invitation = new Invitation();
        invitation.setId(1L);
        invitation.setInvitedUser(testUser);
        invitation.setFamily(testFamily);
        invitation.setStatus("PENDING");
        invitation.setRole("USER");

        when(invitationService.respondInvitation(1L, true)).thenAnswer(inv -> {
            invitation.setStatus("ACCEPTED");
            return invitation;
        });

        mockMvc.perform(post("/api/invitations/1/respond")
                        .param("accept", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.invitedUser.dni").value(testUser.getDni()));
    }

    @Test
    void testRespondInvitationRejectUpdatesStatus() throws Exception {
        Invitation invitation = new Invitation();
        invitation.setId(2L);
        invitation.setInvitedUser(testUser);
        invitation.setFamily(testFamily);
        invitation.setStatus("PENDING");
        invitation.setRole("USER");

        when(invitationService.respondInvitation(2L, false)).thenAnswer(inv -> {
            invitation.setStatus("REJECTED");
            return invitation;
        });

        mockMvc.perform(post("/api/invitations/2/respond")
                        .param("accept", "false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.invitedUser.dni").value(testUser.getDni()));

        verify(invitationService, times(1)).respondInvitation(2L, false);
    }

    @Test
    void testPendingInvitationsReturnsList() throws Exception {
        Invitation invitation = new Invitation();
        invitation.setId(1L);
        invitation.setInvitedUser(testUser);
        invitation.setFamily(testFamily);
        invitation.setStatus("PENDING");
        invitation.setRole("USER");

        when(securityService.getCurrentUser()).thenReturn(testUser);
        when(invitationService.getPendingInvitations(testUser)).thenReturn(List.of(invitation));

        mockMvc.perform(get("/api/invitations/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].role").value("USER"))
                .andExpect(jsonPath("$[0].invitedUser.dni").value(testUser.getDni()))
                .andExpect(jsonPath("$[0].invitedUser.name").value(testUser.getName()));

        verify(invitationService, times(1)).getPendingInvitations(testUser);
    }
}
