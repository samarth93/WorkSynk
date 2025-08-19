package com.workspace.app.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class VideoSdkTokenService {
    
    private static final Logger logger = LoggerFactory.getLogger(VideoSdkTokenService.class);
    
    @Value("${videosdk.apiKey}") 
    private String apiKey;
    
    @Value("${videosdk.secret}") 
    private String secret;
    
    @Value("${videosdk.tokenTtlMinutes:15}") 
    private int ttlMinutes;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String role, boolean moderator, Optional<String> roomIdOpt, Optional<Integer> ttlOverrideMinutes) {
        try {
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("VideoSDK API key is not configured");
            }
            
            if (secret == null || secret.trim().isEmpty()) {
                throw new RuntimeException("VideoSDK secret is not configured");
            }
            
            Instant now = Instant.now();
            Instant exp = now.plusSeconds(60L * ttlOverrideMinutes.orElse(ttlMinutes));
            Map<String, Object> claims = new LinkedHashMap<>();
            claims.put("apikey", apiKey);
            claims.put("version", 2); // VideoSDK v2 token
            claims.put("role", role); // "rtc" (client) or "crawler" (server)
            claims.put("permissions", moderator ? List.of("allow_join","allow_mod") : List.of("allow_join"));
            roomIdOpt.ifPresent(rid -> claims.put("roomId", rid));
            
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setIssuedAt(Date.from(now))
                    .setExpiration(Date.from(exp))
                    .signWith(key(), SignatureAlgorithm.HS256)
                    .compact();
            
            logger.debug("Generated VideoSDK token for role: {} with moderator: {}", role, moderator);
            return token;
            
        } catch (Exception e) {
            logger.error("Failed to generate VideoSDK token: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate video token: " + e.getMessage());
        }
    }
}
