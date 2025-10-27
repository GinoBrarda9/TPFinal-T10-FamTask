package com.team10.famtask.service.profile;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.entity.profile.EmergencyContact;
import com.team10.famtask.entity.profile.MedicalInfo;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.repository.profile.EmergencyContactRepository;
import com.team10.famtask.repository.profile.MedicalInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MedicalInfoService {

    private final MedicalInfoRepository repository;
    private final UserRepository userRepository;

    public MedicalInfo get(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return repository.findByUserDni(user.getDni())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Emergency contact not found"));
    }

    public MedicalInfo createOrUpdate(String email, MedicalInfo data) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        repository.findByUserDni(user.getDni()).ifPresent(existing -> data.setId(existing.getId()));
        data.setUser(user);
        return repository.save(data);
    }
}
