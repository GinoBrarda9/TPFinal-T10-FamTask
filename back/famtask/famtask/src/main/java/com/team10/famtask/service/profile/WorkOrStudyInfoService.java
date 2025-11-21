package com.team10.famtask.service.profile;

import com.team10.famtask.entity.family.User;
import com.team10.famtask.entity.profile.WorkOrStudyInfo;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.repository.profile.WorkOrStudyInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WorkOrStudyInfoService {

    private final WorkOrStudyInfoRepository repository;
    private final UserRepository userRepository;

    public WorkOrStudyInfo get(String dni) {
        return repository.findByUserDni(dni)
                .orElse(new WorkOrStudyInfo());
    }

    public WorkOrStudyInfo createOrUpdate(String dni, WorkOrStudyInfo data) {

        User user = userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        repository.findByUserDni(dni).ifPresent(existing -> data.setId(existing.getId()));

        data.setUser(user);
        return repository.save(data);
    }
}
