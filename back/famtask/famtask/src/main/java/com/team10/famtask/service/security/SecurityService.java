package com.team10.famtask.service.security;

import com.team10.famtask.repository.family.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service("securityService")
public class SecurityService {

    private final UserRepository userRepository;

    public SecurityService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Devuelve true si el usuario actualmente logueado coincide con el DNI pasado.
     */
    public boolean isOwner(String dni) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;

        String loggedInEmail = auth.getName(); // tu JwtFilter pone el email como principal
        return userRepository.findById(dni)
                .map(user -> user.getEmail().equals(loggedInEmail))
                .orElse(false);
    }
}
