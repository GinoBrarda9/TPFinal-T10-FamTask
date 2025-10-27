package com.team10.famtask.util;

import com.team10.famtask.entity.family.Family;
import com.team10.famtask.entity.family.FamilyMember;
import com.team10.famtask.entity.family.User;

import java.util.ArrayList;
import java.util.List;

public class Helper {

    public static User createUser(String dni, String name, String email, String role) {
        User user = new User();
        user.setDni(dni);
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        return user;
    }

    public static FamilyMember createFamilyMember(User user, String role) {
        FamilyMember member = new FamilyMember();
        member.setUser(user);
        member.setRole(role);
        return member;
    }

    public static Family createFamily(Long id, String name, List<FamilyMember> members) {
        Family family = new Family();
        family.setId(id);
        family.setName(name);
        family.setMembers(members != null ? members : new ArrayList<>());
        return family;
    }

}
