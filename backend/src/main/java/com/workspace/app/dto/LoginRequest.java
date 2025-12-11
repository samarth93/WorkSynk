package com.workspace.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for user login requests
 * Supports both 'email' and 'emailOrUsername' field names for backwards compatibility
 */
public class LoginRequest {
    
    @NotBlank(message = "Email or username is required")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String emailOrUsername;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    // Constructors
    public LoginRequest() {}
    
    public LoginRequest(String emailOrUsername, String password) {
        this.emailOrUsername = emailOrUsername;
        this.password = password;
    }
    
    // Getters and Setters
    public String getEmailOrUsername() {
        return emailOrUsername;
    }
    
    public void setEmailOrUsername(String emailOrUsername) {
        this.emailOrUsername = emailOrUsername;
    }
    
    // Support 'email' field name as alias for 'emailOrUsername'
    @JsonProperty("email")
    public void setEmail(String email) {
        this.emailOrUsername = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
