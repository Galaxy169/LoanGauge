package com.loangauge.financialservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "loangauge.exchange";
    public static final String ASSESSMENT_COMPLETED_QUEUE = "assessment.completed";
    public static final String ASSESSMENT_COMPLETED_ROUTING_KEY = "assessment.completed";

    @Bean
    public TopicExchange loanGaugeExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue assessmentCompletedQueue() {
        return new Queue(ASSESSMENT_COMPLETED_QUEUE, true);
    }

    @Bean
    public Binding assessmentCompletedBinding(Queue assessmentCompletedQueue, TopicExchange loanGaugeExchange) {
        return BindingBuilder.bind(assessmentCompletedQueue)
                .to(loanGaugeExchange)
                .with(ASSESSMENT_COMPLETED_ROUTING_KEY);
    }

    public static final String ADVISOR_RESPONDED_QUEUE = "advisor.responded";
    public static final String ADVISOR_RESPONDED_ROUTING_KEY = "advisor.responded";

    @Bean
    public Queue advisorRespondedQueue() {
        return new Queue(ADVISOR_RESPONDED_QUEUE, true);
    }

    @Bean
    public Binding advisorRespondedBinding(Queue advisorRespondedQueue, TopicExchange loanGaugeExchange) {
        return BindingBuilder.bind(advisorRespondedQueue)
                .to(loanGaugeExchange)
                .with(ADVISOR_RESPONDED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}