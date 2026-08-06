package com.loangauge.authservice.config;

import com.loangauge.authservice.entity.Role;
import com.loangauge.authservice.entity.Subscription;
import com.loangauge.authservice.entity.User;
import com.loangauge.authservice.repository.RoleRepository;
import com.loangauge.authservice.repository.SubscriptionRepository;
import com.loangauge.authservice.repository.UserRepository;
import com.loangauge.authservice.util.RoleConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Slf4j
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "loangauge70@gmail.com";
    private static final String ADMIN_RAW_PASSWORD = "Loangauge@1";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedRoles();
        seedSubscriptions();
        seedAdminUser();
    }

    private void seedRoles() {
        createRoleIfNotFound(RoleConstants.USER, "Standard registered user");
        createRoleIfNotFound(RoleConstants.PREMIUM_USER, "Paid subscriber with full feature access");
        createRoleIfNotFound(RoleConstants.FINANCIAL_ADVISOR, "Reviews assessments and gives professional guidance");
        createRoleIfNotFound(RoleConstants.ADMINISTRATOR, "Manages users, loan types, subscriptions, and system settings");
    }

    private void createRoleIfNotFound(String roleName, String description) {
        if (!roleRepository.existsByRoleName(roleName)) {
            roleRepository.save(Role.builder()
                    .roleName(roleName)
                    .description(description)
                    .build());
            log.info("Seeded role: {}", roleName);
        }
    }

    private void seedSubscriptions() {
        createSubscriptionIfNotFound("FREE", BigDecimal.ZERO, "ACTIVE");
        createSubscriptionIfNotFound("PREMIUM", new BigDecimal("499.00"), "ACTIVE");
    }

    private void createSubscriptionIfNotFound(String planName, BigDecimal price, String status) {
        if (!subscriptionRepository.existsByPlanName(planName)) {
            subscriptionRepository.save(Subscription.builder()
                    .planName(planName)
                    .price(price)
                    .status(status)
                    .build());
            log.info("Seeded subscription plan: {}", planName);
        }
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            log.info("Default admin user '{}' already exists. Skipping admin seed.", ADMIN_EMAIL);
            return;
        }

        Role adminRole = roleRepository.findByRoleName(RoleConstants.ADMINISTRATOR)
                .orElseThrow(() -> new IllegalStateException("ADMINISTRATOR role must exist before seeding admin user"));

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
