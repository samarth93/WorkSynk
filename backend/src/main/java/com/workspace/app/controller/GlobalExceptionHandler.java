package com.workspace.app.controller;

import com.workspace.app.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for centralized error handling
 * Provides consistent error responses across all controllers
 */
@ControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * Handle validation errors from @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        logger.warn("Validation error for request: {} - Errors: {}", request.getDescription(false), errors);
        
        return ResponseEntity.badRequest().body(
            ApiResponse.error("Validation failed", errors)
        );
    }
    
    /**
     * Handle access denied exceptions
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<String>> handleAccessDenied(
            AccessDeniedException ex, WebRequest request) {
        
        logger.warn("Access denied for request: {} - Error: {}", request.getDescription(false), ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            ApiResponse.error("Access denied. You don't have permission to perform this action.")
        );
    }
    
    /**
     * Handle resource not found exceptions
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<String>> handleNoHandlerFound(
            NoHandlerFoundException ex, WebRequest request) {
        
        logger.warn("No handler found for request: {} - Method: {} - URL: {}", 
            request.getDescription(false), ex.getHttpMethod(), ex.getRequestURL());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ApiResponse.error("Resource not found")
        );
    }
    
    /**
     * Handle runtime exceptions (business logic errors)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<String>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        
        logger.error("Runtime exception for request: {} - Error: {}", 
            request.getDescription(false), ex.getMessage(), ex);
        
        return ResponseEntity.badRequest().body(
            ApiResponse.error(ex.getMessage())
        );
    }
    
    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<String>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        logger.warn("Illegal argument for request: {} - Error: {}", 
            request.getDescription(false), ex.getMessage());
        
        return ResponseEntity.badRequest().body(
            ApiResponse.error("Invalid request: " + ex.getMessage())
        );
    }
    
    /**
     * Handle all other exceptions (catch-all)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleGenericException(
            Exception ex, WebRequest request) {
        
        logger.error("Unexpected error for request: {} - Error: {}", 
            request.getDescription(false), ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ApiResponse.error("An unexpected error occurred. Please try again later.")
        );
    }
}
