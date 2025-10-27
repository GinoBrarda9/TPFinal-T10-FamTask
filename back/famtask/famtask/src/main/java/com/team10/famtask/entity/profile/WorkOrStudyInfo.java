package com.team10.famtask.entity.profile;

import com.team10.famtask.entity.family.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "work_or_study_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrStudyInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String activityType;     // "Trabajo" o "Estudio"
    private String organization;     // institución o empresa
    private String positionOrGrade;  // cargo o grado
    private String schedule;         // horario

    @OneToOne
    @JoinColumn(name = "user_dni", nullable = false, unique = true)
    private User user;
}
