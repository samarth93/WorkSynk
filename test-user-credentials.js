#!/usr/bin/env node

/**
 * Test script to verify fixes with provided credentials
 * Admin: palsamarth9@gmail.com / Sama.1234
 * Normal user: samarthdev.io@gmail.com / Arun.1234
 */

const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function apiCall(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${API_BASE}${endpoint}`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
}

async function testAdminUser() {
  log('\n=== Testing Admin User (palsamarth9@gmail.com) ===', colors.cyan);
  
  try {
    // Login as admin
    log('\n1. Login as admin...', colors.yellow);
    const loginRes = await apiCall('POST', '/auth/login', {
      email: 'palsamarth9@gmail.com',
      password: 'Sama.1234'
    });
    
    if (loginRes.data.success) {
      const adminToken = loginRes.data.data.token;
      log('✓ Admin login successful', colors.green);
      log(`  Token: ${adminToken.substring(0, 20)}...`, colors.blue);
      
      // Test profile access
      log('\n2. Get admin profile...', colors.yellow);
      const profileRes = await apiCall('GET', '/users/profile', null, adminToken);
      log('✓ Profile retrieved', colors.green);
      log(`  Username: ${profileRes.data.data.username}`, colors.blue);
      log(`  Email: ${profileRes.data.data.email}`, colors.blue);
      log(`  Is Global Admin: ${profileRes.data.data.globalAdmin}`, colors.blue);
      
      // Test admin endpoint - get all users
      log('\n3. Get all users (admin endpoint)...', colors.yellow);
      const usersRes = await apiCall('GET', '/admin/users', null, adminToken);
      log('✓ All users retrieved', colors.green);
      log(`  Total users: ${usersRes.data.data.length}`, colors.blue);
      
      // Test admin endpoint - get all rooms
      log('\n4. Get all rooms (admin endpoint)...', colors.yellow);
      const roomsRes = await apiCall('GET', '/admin/rooms', null, adminToken);
      log('✓ All rooms retrieved', colors.green);
      log(`  Total rooms: ${roomsRes.data.data.length}`, colors.blue);
      
      // Test admin endpoint - get stats
      log('\n5. Get system stats (admin endpoint)...', colors.yellow);
      const statsRes = await apiCall('GET', '/admin/stats', null, adminToken);
      log('✓ System stats retrieved', colors.green);
      log(`  Total Users: ${statsRes.data.data.totalUsers}`, colors.blue);
      log(`  Total Rooms: ${statsRes.data.data.totalRooms}`, colors.blue);
      log(`  Active Users: ${statsRes.data.data.activeUsers}`, colors.blue);
      log(`  Public Rooms: ${statsRes.data.data.publicRooms}`, colors.blue);
      log(`  Private Rooms: ${statsRes.data.data.privateRooms}`, colors.blue);
      
      // Test room creation
      log('\n6. Create a new room...', colors.yellow);
      const roomRes = await apiCall('POST', '/rooms', {
        name: 'Admin Test Room ' + Date.now(),
        description: 'Test room created by admin',
        private: false,
        maxMembers: 50
      }, adminToken);
      log('✓ Room created successfully', colors.green);
      log(`  Room ID: ${roomRes.data.data.id}`, colors.blue);
      
      return { success: true, token: adminToken };
    }
  } catch (error) {
    log('✗ Admin test failed: ' + (error.response?.data?.message || error.message), colors.red);
    return { success: false };
  }
}

async function testNormalUser() {
  log('\n\n=== Testing Normal User (samarthdev.io@gmail.com) ===', colors.cyan);
  
  try {
    // Login as normal user
    log('\n1. Login as normal user...', colors.yellow);
    const loginRes = await apiCall('POST', '/auth/login', {
      email: 'samarthdev.io@gmail.com',
      password: 'Arun.1234'
    });
    
    if (loginRes.data.success) {
      const userToken = loginRes.data.data.token;
      log('✓ Normal user login successful', colors.green);
      log(`  Token: ${userToken.substring(0, 20)}...`, colors.blue);
      
      // Test profile access
      log('\n2. Get user profile...', colors.yellow);
      const profileRes = await apiCall('GET', '/users/profile', null, userToken);
      log('✓ Profile retrieved', colors.green);
      log(`  Username: ${profileRes.data.data.username}`, colors.blue);
      log(`  Email: ${profileRes.data.data.email}`, colors.blue);
      log(`  Is Global Admin: ${profileRes.data.data.globalAdmin}`, colors.blue);
      
      // Test status update
      log('\n3. Update user status...', colors.yellow);
      await apiCall('PUT', '/users/status', { status: 'online' }, userToken);
      log('✓ Status updated to online', colors.green);
      
      // Test getting rooms
      log('\n4. Get my rooms...', colors.yellow);
      const roomsRes = await apiCall('GET', '/rooms/my', null, userToken);
      log('✓ Rooms retrieved', colors.green);
      log(`  Total rooms: ${roomsRes.data.data.length}`, colors.blue);
      
      // Test accessing admin endpoint (should fail)
      log('\n5. Try to access admin endpoint (should fail)...', colors.yellow);
      try {
        await apiCall('GET', '/admin/users', null, userToken);
        log('✗ SECURITY ISSUE: Normal user accessed admin endpoint!', colors.red);
      } catch (error) {
        if (error.response?.status === 403) {
          log('✓ Correctly blocked from admin endpoint (403 Forbidden)', colors.green);
        } else {
          log(`✓ Blocked from admin endpoint (${error.response?.status})`, colors.green);
        }
      }
      
      return { success: true, token: userToken };
    }
  } catch (error) {
    log('✗ Normal user test failed: ' + (error.response?.data?.message || error.message), colors.red);
    return { success: false };
  }
}

async function testUnauthorizedAccess() {
  log('\n\n=== Testing Unauthorized Access ===', colors.cyan);
  
  try {
    log('\n1. Try to access protected endpoint without token...', colors.yellow);
    try {
      await apiCall('GET', '/users/profile', null, null);
      log('✗ SECURITY ISSUE: Accessed protected endpoint without token!', colors.red);
      return false;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.data?.message?.includes('not authenticated')) {
        log('✓ Correctly blocked (401 Unauthorized)', colors.green);
        return true;
      } else {
        log(`✓ Blocked with status ${error.response?.status}`, colors.green);
        return true;
      }
    }
  } catch (error) {
    log('✗ Test failed: ' + error.message, colors.red);
    return false;
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', colors.cyan);
  log('║       WorkSynk - User Credentials Test Suite         ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════╝', colors.cyan);
  
  const adminResult = await testAdminUser();
  const normalUserResult = await testNormalUser();
  const unauthorizedResult = await testUnauthorizedAccess();
  
  log('\n\n╔════════════════════════════════════════════════════════╗', colors.cyan);
  log('║                   Test Summary                        ║', colors.cyan);
  log('╚════════════════════════════════════════════════════════╝', colors.cyan);
  
  log(`\nAdmin User Tests: ${adminResult.success ? '✓ PASSED' : '✗ FAILED'}`, 
      adminResult.success ? colors.green : colors.red);
  log(`Normal User Tests: ${normalUserResult.success ? '✓ PASSED' : '✗ FAILED'}`, 
      normalUserResult.success ? colors.green : colors.red);
  log(`Unauthorized Access Test: ${unauthorizedResult ? '✓ PASSED' : '✗ FAILED'}`, 
      unauthorizedResult ? colors.green : colors.red);
  
  const allPassed = adminResult.success && normalUserResult.success && unauthorizedResult;
  
  log(`\n${allPassed ? '✓ ALL TESTS PASSED!' : '✗ SOME TESTS FAILED'}`, 
      allPassed ? colors.green : colors.red);
}

main().catch(console.error);
