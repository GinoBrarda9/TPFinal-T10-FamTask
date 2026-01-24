package com.team10.famtask.dto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class InvitationRequestDTO {
    private Long familyId;
    private String invitedUserEmail;
    private String role;       // ADMIN | USER
    private String familyRole; // PARENT | CHILD (nuevo, opcional)

    public InvitationRequestDTO() {}

    public Long getFamilyId() { return familyId; }
    public void setFamilyId(Long familyId) { this.familyId = familyId; }

    public String getInvitedUserEmail() { return invitedUserEmail; }
    public void setInvitedUserEmail(String invitedUserEmail) { this.invitedUserEmail = invitedUserEmail; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getFamilyRole() { return familyRole; }
    public void setFamilyRole(String familyRole) { this.familyRole = familyRole; }
}
