package com.loangauge.notificationservice.service.impl;

import com.loangauge.notificationservice.entity.Notification;
import com.loangauge.notificationservice.repository.NotificationRepository;
import com.loangauge.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public Notification notify(String userId, String type, String message) {
        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(n);
    }

    @Override
    public List<Notification> getForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}