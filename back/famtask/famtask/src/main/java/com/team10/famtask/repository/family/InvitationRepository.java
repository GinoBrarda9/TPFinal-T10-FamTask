package com.team10.famtask.repository.family;

import com.team10.famtask.entity.family.Invitation;
import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Optional<Invitation> findByFamilyAndInvitedUser(Family family, User invitedUser);

    List<Invitation> findByInvitedUserAndStatus(User invitedUser, String status);

}
