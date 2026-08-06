package com.loangauge.notificationservice.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ASSESSMENT_COMPLETED_QUEUE = "assessment.completed";

    // Declared here too (matching financial-service's declaration exactly — same
    // name, same durability) so this service doesn't depend on financial-service
    // having started first. RabbitMQ treats identical re-declarations as a no-op.
    @Bean
    public Queue assessmentCompletedQueue() {
        return new Queue(ASSESSMENT_COMPLETED_QUEUE, true);
    }

    public static final String ADVISOR_RESPONDED_QUEUE = "advisor.responded";

    @Bean
    public Queue advisorRespondedQueue() {
        return new Queue(ADVISOR_RESPONDED_QUEUE, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}