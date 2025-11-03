package com.team10.famtask.dto.profile;

public record ContactInfoDTO(
        String phone,
        String address,
        String city,
        String province,
        String country
) {}
