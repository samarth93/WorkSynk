# Security Configuration Guide

## Environment Variables

To run the application securely, set the following environment variables:

### Database Configuration
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workspace-app?retryWrites=true&w=majority&appName=Cluster0
```

### JWT Configuration
```bash
JWT_SECRET=YourSuperSecretJWTKeyHere_MinimumOf256BitsForHS512Algorithm
JWT_EXPIRATION=86400000
```

### CORS Configuration
```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Authorization,Content-Type,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers
CORS_ALLOW_CREDENTIALS=true
```

### WebSocket Configuration
```bash
WEBSOCKET_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Logging Configuration
```bash
LOG_LEVEL=INFO
SECURITY_LOG_LEVEL=INFO
WEB_LOG_LEVEL=INFO
```

## Security Improvements Made

1. **Externalized Configuration**: Moved hardcoded secrets to environment variables
2. **CORS Security**: Fixed wildcard CORS configuration
3. **Updated Dependencies**: Updated Spring Boot to latest stable version
4. **Proper Configuration Structure**: Organized configuration under `app.*` namespace

## Production Deployment

For production deployment:
1. Set secure, randomly generated JWT_SECRET (minimum 256 bits)
2. Use production MongoDB URI with authentication
3. Restrict CORS_ALLOWED_ORIGINS to only your frontend domain
4. Set LOG_LEVEL=WARN for performance
5. Use HTTPS for all communications
