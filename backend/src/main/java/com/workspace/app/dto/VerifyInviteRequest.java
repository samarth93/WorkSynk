package com.workspace.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for verifying workspace invite by email
 */
public class VerifyInviteRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;
    
    // Constructors
    public VerifyInviteRequest() {}
    
    public VerifyInviteRequest(String email) {
        this.email = email;
    }
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
}
