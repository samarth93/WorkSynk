package com.workspace.app.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
public class VideoSdkRoomService {
    
    private static final Logger logger = LoggerFactory.getLogger(VideoSdkRoomService.class);
    
    private final WebClient client = WebClient.builder()
        .baseUrl("https://api.videosdk.live/v2")
        .build();
    
    private final VideoSdkTokenService tokens;
    
    public VideoSdkRoomService(VideoSdkTokenService tokens) { 
        this.tokens = tokens; 
    }
    
    public Mono<String> createRoom(String customRoomId) {
        String crawlerToken = tokens.generateToken("crawler", true, Optional.empty(), Optional.of(5));
        
        return client.post()
            .uri("/rooms")
            .header("authorization", crawlerToken)
            .header(HttpHeaders.CONTENT_TYPE, "application/json")
            .bodyValue(Map.of("customRoomId", customRoomId))
            .retrieve()
            .bodyToMono(Map.class)
            .timeout(Duration.ofSeconds(30)) // 30 second timeout
            .map(res -> {
                String roomId = (String) res.get("roomId");
                if (roomId == null) {
                    throw new RuntimeException("VideoSDK API did not return a room ID");
                }
                logger.info("Successfully created VideoSDK room: {}", roomId);
                return roomId;
            })
            .onErrorMap(WebClientResponseException.class, ex -> {
                logger.error("VideoSDK API error: {} - Status: {} - Body: {}", 
                    ex.getMessage(), ex.getStatusCode(), ex.getResponseBodyAsString());
                return new RuntimeException("Failed to create video room: " + ex.getStatusText());
            })
            .onErrorMap(Exception.class, ex -> {
                if (ex.getMessage().contains("timeout")) {
                    logger.error("VideoSDK API timeout for room: {}", customRoomId);
                    return new RuntimeException("Video room creation timed out. Please try again.");
                }
                logger.error("Unexpected error creating VideoSDK room: {}", ex.getMessage(), ex);
                return new RuntimeException("Failed to create video room. Please try again later.");
            });
    }
}
