package com.team10.famtask.service.profile;

import com.team10.famtask.dto.profile.ContactInfoDTO;
import com.team10.famtask.entity.family.User;
import com.team10.famtask.entity.profile.ContactInfo;
import com.team10.famtask.entity.profile.EmergencyContact;
import com.team10.famtask.repository.family.UserRepository;
import com.team10.famtask.repository.profile.ContactInfoRepository;
import com.team10.famtask.repository.profile.EmergencyContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ContactInfoService {

    private final ContactInfoRepository repository;
    private final UserRepository userRepository;

    public ContactInfoDTO createOrUpdateByDni(String dni, ContactInfo data) {

        User user = userRepository.findById(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ContactInfo ci = repository.findByUser_Dni(dni)
                .orElse(ContactInfo.builder().user(user).build());

        ci.setPhone(data.getPhone());
        ci.setAddress(data.getAddress());
        ci.setCity(data.getCity());
        ci.setProvince(data.getProvince());
        ci.setCountry(data.getCountry());

        ContactInfo saved = repository.save(ci);

        return new ContactInfoDTO(
                saved.getPhone(),
                saved.getAddress(),
                saved.getCity(),
                saved.getProvince(),
                saved.getCountry()
        );
    }

    public ContactInfoDTO get(String dni) {
        ContactInfo info = repository.findByUser_Dni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        return new ContactInfoDTO(
                info.getPhone(),
                info.getAddress(),
                info.getCity(),
                info.getProvince(),
                info.getCountry()
        );
    }

}
