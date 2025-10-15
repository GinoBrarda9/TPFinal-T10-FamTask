package com.team10.famtask.service.security;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

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

    /**
     * Devuelve el usuario actualmente autenticado, o null si no hay ninguno.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        String email = auth.getName();
        Optional<User> user = userRepository.findByEmail(email);
        return user.orElse(null);
    }

    public User getUserByDni(String dni) {
        return userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }


}
