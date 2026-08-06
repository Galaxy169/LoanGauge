package com.loangauge.notificationservice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import com.loangauge.notificationservice.service.GeminiService;
import com.loangauge.notificationservice.util.PromptBuilder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiServiceImpl implements GeminiService {

    private final PromptBuilder promptBuilder;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.api-url}")
    private String apiUrl;

    @Override
    public List<String> getRecommendations(AssessmentCompletedEvent event) throws Exception {
        log.info("Calling Gemini API for assessmentId={}", event.getAssessmentId());

        String prompt = promptBuilder.buildRecommendationPrompt(event);

        // 1. Build Payload
        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        // 2. Add Explicit Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        // 3. Construct URL
        String url = apiUrl + "?key=" + apiKey;

        // 4. Execute Request
        String responseBody = restTemplate.postForObject(url, requestEntity, String.class);

        // 5. Safely Extract & Parse JSON
        String text = extractTextFromJson(responseBody);
        JsonNode array = objectMapper.readTree(text);

        List<String> tips = new ArrayList<>();
        if (array.isArray()) {
            array.forEach(node -> tips.add(node.asText()));
        } else {
            tips.add(array.asText());
        }

        log.info("Gemini API succeeded for assessmentId={}", event.getAssessmentId());
        return tips;
    }

    private String extractTextFromJson(String jsonResponse) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);
        String raw = root.path("candidates")
                        .get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();

        return raw.replaceAll("```json", "")
                  .replaceAll("```", "")
                  .trim();
    }
}