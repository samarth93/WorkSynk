package com.workspace.app.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for user login requests
 */
public class LoginRequest {
    
    @NotBlank(message = "Email or username is required")
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
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
}
