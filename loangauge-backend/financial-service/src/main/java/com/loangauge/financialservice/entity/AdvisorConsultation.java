package com.loangauge.financialservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "advisor_consultation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdvisorConsultation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consultation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private LoanAssessment assessment;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "advisor_user_id")
    private Long advisorUserId;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";
}
