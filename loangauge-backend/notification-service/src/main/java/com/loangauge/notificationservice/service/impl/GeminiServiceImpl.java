package com.loangauge.notificationservice.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loangauge.notificationservice.dto.AssessmentCompletedEvent;
import com.loangauge.notificationservice.service.GeminiService;
import com.loangauge.notificationservice.util.PromptBuilder;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        String url = apiUrl + "?key=" + apiKey;
        Map<String, Object> response = restTemplate.postForObject(url, body, Map.class);

        String text = extractText(response);
        JsonNode array = objectMapper.readTree(text);

        List<String> tips = new ArrayList<>();
        array.forEach(node -> tips.add(node.asText()));

        log.info("Gemini API succeeded for assessmentId={}", event.getAssessmentId());
        return tips;
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        var candidates = (List<Map<String, Object>>) response.get("candidates");
        var content = (Map<String, Object>) candidates.get(0).get("content");
        var parts = (List<Map<String, Object>>) content.get("parts");
        String raw = (String) parts.get(0).get("text");
        return raw.replaceAll("```json", "").replaceAll("```", "").trim();
    }
}