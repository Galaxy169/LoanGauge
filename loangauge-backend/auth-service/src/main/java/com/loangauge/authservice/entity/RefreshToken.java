package com.loangauge.authservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
<<<<<<< HEAD
@Table(name = "refresh_token")
=======
@Table(name = "refresh_tokens")
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_token_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean revoked = false;
}