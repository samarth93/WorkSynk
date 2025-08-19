# MongoDB Atlas Connection Fix Guide

## Problem
Your MongoDB Atlas cluster is not accepting connections, causing timeout errors.

## Solution 1: Fix MongoDB Atlas Network Access

1. **Go to MongoDB Atlas Dashboard** (https://cloud.mongodb.com)
2. **Navigate to Security > Network Access**
3. **Add IP Address**:
   - Click "Add IP Address"
   - Either add your current IP address or add `0.0.0.0/0` (allow all IPs for development)
   - Save the configuration

4. **Check Database User**:
   - Go to Security > Database Access
   - Ensure user `palsamarth9` exists with password `sama.1234`
   - Make sure it has `readWrite` permissions on all databases

## Solution 2: Use Alternative Connection String

Try this alternative connection string in application.yml:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://palsamarth9:sama.1234@ac-yttvsoq-shard-00-00.4yyhdbj.mongodb.net:27017,ac-yttvsoq-shard-00-01.4yyhdbj.mongodb.net:27017,ac-yttvsoq-shard-00-02.4yyhdbj.mongodb.net:27017/workspace-app?ssl=true&replicaSet=atlas-13tez2-shard-0&authSource=admin&retryWrites=true&w=majority
```

## Solution 3: Temporary Local MongoDB (Development)

If you want to test the application immediately:

1. Install MongoDB locally:
   ```bash
   sudo apt update
   sudo apt install mongodb
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

2. Update application.yml:
   ```yaml
   spring:
     data:
       mongodb:
         uri: mongodb://localhost:27017/workspace-app
   ```

## Solution 4: MongoDB Connection Diagnostics

Test your connection manually:
```bash
# Test if you can reach MongoDB Atlas servers
ping ac-yttvsoq-shard-00-00.4yyhdbj.mongodb.net

# Test if MongoDB port is accessible
telnet ac-yttvsoq-shard-00-00.4yyhdbj.mongodb.net 27017
```

## Current Status
- ✅ Frontend: Working properly with styling
- ✅ Backend: Running but can't connect to database
- ❌ MongoDB: Connection timeout issues
- ✅ Authentication flow: Ready (waiting for database)

## Quick Test
Once you fix the MongoDB connection, test with:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"palsamarth9@gmail.com","password":"Sama.1234"}'
```
