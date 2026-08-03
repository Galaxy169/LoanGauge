package com.loangauge.notificationservice.service;

import com.loangauge.notificationservice.entity.Notification;
import java.util.List;

public interface NotificationService {
    Notification notify(String userId, String type, String message);
    List<Notification> getForUser(String userId);
    void markAsRead(String notificationId);
}