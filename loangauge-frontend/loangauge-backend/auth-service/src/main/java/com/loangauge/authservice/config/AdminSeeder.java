package com.loangauge.authservice.config;

import com.loangauge.authservice.entity.Role;
import com.loangauge.authservice.entity.User;
import com.loangauge.authservice.repository.RoleRepository;
import com.loangauge.authservice.repository.UserRepository;
import com.loangauge.authservice.util.RoleConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "loangauge70@gmail.com";
    private static final String ADMIN_RAW_PASSWORD = "Loangauge@1";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Default admin user '{}' already exists. Skipping database seed.", ADMIN_EMAIL);
            return;
        }

        Role adminRole = roleRepository.findByRoleName(RoleConstants.ADMINISTRATOR)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName(RoleConstants.ADMINISTRATOR)
                        .description("Manages users, loan types, subscriptions, and system settings")
                        .build()));

        User adminUser = User.builder()
                .firstName("Admin")
                .lastName("System")
                .email(ADMIN_EMAIL)
                .password(passwordEncoder.encode(ADMIN_RAW_PASSWORD))
                .role(adminRole)
                .status("ACTIVE")
                .build();

        userRepository.save(adminUser);
        log.info("Successfully seeded default administrator account: {}", ADMIN_EMAIL);
    }
}
