package com.team10.famtask.service.family;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.FamilyMemberId;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.FamilyMemberRepository;
import com.team10.famtask.repository.family.FamilyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class FamilyServiceTest {

    @Mock
    private FamilyRepository familyRepository;

    @Mock
    private FamilyMemberRepository familyMemberRepository;

    @InjectMocks
    private FamilyService familyService;

    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        adminUser = new User();
        adminUser.setDni("1111");
        adminUser.setName("Admin User");
        adminUser.setRole("ADMIN");

        normalUser = new User();
        normalUser.setDni("2222");
        normalUser.setName("Normal User");
        normalUser.setRole("USER");
    }

    @Test
    void shouldCreateFamilyWhenUserIsAdmin() {
        // given
        String familyName = "Familia Reyna";
        Family savedFamily = new Family();
        savedFamily.setId(1L);
        savedFamily.setName(familyName);

        when(familyRepository.save(any(Family.class))).thenReturn(savedFamily);

        // when
        Family result = familyService.createFamily(familyName, adminUser);

        // then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo(familyName);

        ArgumentCaptor<FamilyMember> captor = ArgumentCaptor.forClass(FamilyMember.class);
        verify(familyMemberRepository).save(captor.capture());

        FamilyMember savedMember = captor.getValue();
        assertThat(savedMember.getId()).isEqualTo(new FamilyMemberId(adminUser.getDni(), 1L));
        assertThat(savedMember.getRole()).isEqualTo("ADMIN");
        assertThat(savedMember.getJoinedAt()).isBeforeOrEqualTo(LocalDateTime.now());

        verify(familyRepository, times(1)).save(any(Family.class));
        verify(familyMemberRepository, times(1)).save(any(FamilyMember.class));
    }

    @Test
    void shouldThrowExceptionWhenUserIsNotAdmin() {
        // given
        String familyName = "Familia Normal";

        // when / then
        assertThatThrownBy(() -> familyService.createFamily(familyName, normalUser))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Solo los administradores pueden crear familias");

        verify(familyRepository, never()).save(any(Family.class));
        verify(familyMemberRepository, never()).save(any(FamilyMember.class));
    }
}
