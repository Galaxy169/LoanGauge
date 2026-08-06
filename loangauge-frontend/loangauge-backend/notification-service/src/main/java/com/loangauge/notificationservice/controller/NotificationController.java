package com.loangauge.notificationservice.controller;

import com.loangauge.notificationservice.dto.ApiResponse;
import com.loangauge.notificationservice.entity.Notification;
import com.loangauge.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ApiResponse<List<Notification>> getNotifications(@PathVariable String userId) {
        return ApiResponse.success(notificationService.getForUser(userId));
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ApiResponse.success(null, "Marked as read");
    }
}