package com.workspace.app.config;

import com.workspace.app.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Security Configuration for the workspace application
 * Configures JWT authentication, CORS, and security policies
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;
    
    @Value("${cors.allowed-methods}")
    private String allowedMethods;
    
    @Value("${cors.allowed-headers}")
    private String allowedHeaders;
    
    @Value("${cors.allow-credentials}")
    private boolean allowCredentials;
    
    /**
     * Password encoder bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * Security filter chain configuration
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - using full paths including context
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/public/**").permitAll() 
                .requestMatchers("/health").permitAll()
                .requestMatchers("/info").permitAll()
                
                // WebSocket endpoints
                .requestMatchers("/ws/**").permitAll()
                
                // OPTIONS requests for CORS preflight
                .requestMatchers("OPTIONS", "/**").permitAll()
                
                // Admin endpoints (workspace-level admin check handled in controller)
                .requestMatchers("/admin/**").authenticated()
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * CORS configuration
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Set allowed origins - be more explicit
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        
        // Set allowed methods - include OPTIONS for preflight
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        
        // Set allowed headers - be more specific
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Expose headers
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        // Set credentials
        configuration.setAllowCredentials(true);
        
        // Set max age for preflight cache
        configuration.setMaxAge(3600L);
        
        // Apply configuration to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
