package com.workspace.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time chat functionality
 * Configures STOMP endpoints and message broker for chat messages
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Value("${websocket.allowed-origins}")
    private String allowedOrigins;
    
    /**
     * Configure message broker for pub/sub messaging
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to carry messages
        // back to the client on destinations prefixed with "/topic" and "/queue"
        config.enableSimpleBroker("/topic", "/queue");
        
        // Designate the "/app" prefix for messages that are bound 
        // for @MessageMapping-annotated methods
        config.setApplicationDestinationPrefixes("/app");
        
        // Set user destination prefix for private messages
        config.setUserDestinationPrefix("/user");
    }
    
    /**
     * Register STOMP endpoints
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register the "/ws" endpoint for WebSocket connections
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins.split(","))
                .withSockJS(); // Enable SockJS fallback
        
        // Register endpoint without SockJS for native WebSocket support
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins.split(","));
                
        // Future video call WebSocket endpoint placeholder
        registry.addEndpoint("/ws/video")
                .setAllowedOrigins(allowedOrigins.split(","))
                .withSockJS();
    }
}
