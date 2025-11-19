package com.team10.famtask.service.family;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.repository.family.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 🔹 Listar todos los usuarios (solo admin lo puede usar)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 🔹 Obtener un usuario por DNI
    public Optional<User> getUserByDni(String dni) {
        return userRepository.findById(dni);
    }

    // 🔹 Crear un nuevo usuario (admin lo hace manualmente o se usa register)
    public User createUser(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER"); // rol por defecto
        }

        return userRepository.save(user);
    }

    // 🔹 Actualizar datos de un usuario
    public Optional<User> updateUser(String dni, User updatedUser) {
        return userRepository.findById(dni).map(existingUser -> {
            // Nombre
            if (updatedUser.getName() != null && !updatedUser.getName().isBlank()) {
                existingUser.setName(updatedUser.getName());
            }

            // Email
            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isBlank()) {
                existingUser.setEmail(updatedUser.getEmail());
            }

            // Password: solo si viene uno nuevo
            if (updatedUser.getPasswordHash() != null && !updatedUser.getPasswordHash().isBlank()) {
                existingUser.setPasswordHash(passwordEncoder.encode(updatedUser.getPasswordHash()));
            }

            // Rol: solo admins pueden cambiarlo (control en el controller)
            if (updatedUser.getRole() != null && !updatedUser.getRole().isBlank()) {
                existingUser.setRole(updatedUser.getRole());
            }

            return userRepository.save(existingUser);
        });
    }


    // 🔹 Eliminar usuario
    public boolean deleteUser(String dni) {
        if (!userRepository.existsById(dni)) {
            return false;
        }
        userRepository.deleteById(dni);
        return true;
    }

    public Optional<User> getUserByDniWithFamily(String dni) {
        return userRepository.findFullUser(dni);
    }

}
