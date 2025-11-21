package com.team10.famtask.service.profile;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.entity.profile.EmergencyContact;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.repository.profile.EmergencyContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class EmergencyContactService {

    private final EmergencyContactRepository repository;
    private final UserRepository userRepository;

    public EmergencyContact get(String dni) {
        return repository.findByUserDni(dni)
                .orElse(new EmergencyContact()); // no explota si está vacío
    }

    public EmergencyContact createOrUpdate(String dni, EmergencyContact data) {

        User user = userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Si ya existe, actualizamos, si no creamos
        repository.findByUserDni(dni).ifPresent(existing -> data.setId(existing.getId()));

        data.setUser(user);
        return repository.save(data);
    }
}
