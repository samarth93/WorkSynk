package com.workspace.app.security;

import com.workspace.app.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * JWT Authentication Filter
 * Intercepts requests and validates JWT tokens
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    @Lazy
    private UserService userService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String userId = jwtUtils.getUserIdFromJwtToken(jwt);
                String username = jwtUtils.getUsernameFromJwtToken(jwt);
                
                // Create authentication object
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userId, 
                        null, 
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                
                // Set additional details
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                // Add user info to request attributes for easy access
                request.setAttribute("userId", userId);
                request.setAttribute("username", username);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: " + e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extract JWT token from request header
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
    
    /**
     * Skip filter for certain endpoints
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // Skip authentication for these endpoints
        return path.startsWith("/api/auth/") || 
               path.startsWith("/api/public/") ||
               path.equals("/api/health") ||
               path.startsWith("/ws/") || // WebSocket endpoint
               path.startsWith("/api/ws/"); // WebSocket info endpoint
    }
}
