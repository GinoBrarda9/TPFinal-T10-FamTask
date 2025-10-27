package com.team10.famtask.service.security;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final HttpServletRequest request;

    /**
     * Verifica si el usuario autenticado es dueño del recurso (por DNI).
     */
    public boolean isOwner(String dni) {
        User current = getCurrentUser();
        return current != null && current.getDni().equals(dni);
    }

    /**
     * Obtiene el usuario autenticado a partir del token JWT.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no autenticado");
        }

        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }


    /**
     * Obtiene el rol actual del token.
     */
    public String getCurrentRole() {
        String jwt = extractJwtFromRequest();
        if (jwt == null) return null;
        return jwtService.extractRole(jwt);
    }

    /**
     * Extrae el JWT desde el header Authorization.
     */
    private String extractJwtFromRequest() {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    /**
     * Busca un usuario por DNI, lanza error 404 si no existe.
     */
    public User getUserByDni(String dni) {
        return userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
