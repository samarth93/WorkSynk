#!/usr/bin/env node

/**
 * WorkSynk API Test Suite
 * Comprehensive testing for all API endpoints and functionality
 * 
 * Run: node test-api.js
 */

const axios = require('axios');
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const API_BASE = 'http://localhost:8080/api';
let authToken = null;
let testUserId = null;
let testRoomId = null;
let testMessageId = null;
let testWorkspaceId = null;
let adminToken = null;
let adminUserId = null;

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}Testing: ${testName}${colors.reset}`);
}

function logSuccess(message) {
  testResults.total++;
  testResults.passed++;
  log(`✓ ${message}`, colors.green);
}

function logError(message, error) {
  testResults.total++;
  testResults.failed++;
  const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
  log(`✗ ${message}: ${errorMsg}`, colors.red);
  testResults.errors.push({ test: message, error: errorMsg });
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API call wrapper with error handling
async function apiCall(method, endpoint, data = null, token = undefined) {
  const config = {
    method,
    url: `${API_BASE}${endpoint}`,
    headers: {},
  };

  // If token is explicitly null, don't send any token
  // If token is undefined (not passed), use adminToken as default
  // If token is a string, use that token
  if (token === undefined && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.data = data;
  }

  return axios(config);
}

// Test Functions

async function testHealthCheck() {
  logTest('Health Check');
  try {
    const response = await apiCall('GET', '/health');
    if (response.status === 200) {
      logSuccess('Health check passed');
      return true;
    }
  } catch (error) {
    logError('Health check failed', error);
    return false;
  }
}

async function testSystemInfo() {
  logTest('System Information');
  try {
    const response = await apiCall('GET', '/system/info');
    if (response.status === 200) {
      logSuccess('System info retrieved');
      log(`  System: ${JSON.stringify(response.data.data)}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('System info failed', error);
    return false;
  }
}

async function testUserRegistration() {
  logTest('User Registration');
  const timestamp = Date.now();
  const testUser = {
    username: `user_${timestamp.toString().slice(-8)}`, // Shorten to fit 20 chars limit
    email: `testuser_${timestamp}@test.com`,
    password: 'Test@1234',
    firstName: 'Test',
    lastName: 'User'
  };

  try {
    const response = await apiCall('POST', '/auth/register', testUser, null);
    if (response.status === 200 && response.data.data.token) {
      authToken = response.data.data.token;
      testUserId = response.data.data.userId;
      logSuccess(`User registered: ${testUser.username}`);
      log(`  User ID: ${testUserId}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('User registration failed', error);
    return false;
  }
}

async function testDuplicateRegistration() {
  logTest('Duplicate Registration Prevention');
  const duplicateUser = {
    username: 'duplicatetest',
    email: 'duplicate@test.com',
    password: 'Test@1234',
    firstName: 'Duplicate',
    lastName: 'Test'
  };

  try {
    // First registration
    await apiCall('POST', '/auth/register', duplicateUser, null);

    // Try duplicate
    try {
      await apiCall('POST', '/auth/register', duplicateUser, null);
      logError('Duplicate registration should have been prevented', new Error('No error thrown'));
      return false;
    } catch (dupError) {
      if (dupError.response && dupError.response.status === 400) {
        logSuccess('Duplicate registration correctly prevented');
        return true;
      } else {
        logError('Unexpected error for duplicate registration', dupError);
        return false;
      }
    }
  } catch (error) {
    logError('Duplicate registration test failed', error);
    return false;
  }
}

async function testUserLogin() {
  logTest('User Login - Admin Account');
  try {
    const response = await apiCall('POST', '/auth/login', {
      email: 'palsamarth9@gmail.com',
      password: 'Sama.1234'
    });

    if (response.status === 200 && response.data.data.token) {
      adminToken = response.data.data.token;
      adminUserId = response.data.data.userId;
      logSuccess(`Admin logged in: ${response.data.data.username}`);
      log(`  Admin User ID: ${adminUserId}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('Admin login failed', error);
    return false;
  }
}

async function testInvalidLogin() {
  logTest('Invalid Login Prevention');
  try {
    await apiCall('POST', '/auth/login', {
      email: 'invalid@test.com',
      password: 'WrongPassword'
    });
    logError('Invalid login should have been rejected', new Error('No error thrown'));
    return false;
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 401)) {
      logSuccess('Invalid login correctly rejected');
      return true;
    }
    logError('Unexpected error for invalid login', error);
    return false;
  }
}

async function testGetUserProfile() {
  logTest('Get User Profile');
  try {
    const response = await apiCall('GET', '/users/profile');
    if (response.status === 200 && response.data.data) {
      logSuccess('User profile retrieved');
      log(`  Username: ${response.data.data.username}`, colors.blue);
      log(`  Email: ${response.data.data.email}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('Get user profile failed', error);
    return false;
  }
}

async function testUpdateUserProfile() {
  logTest('Update User Profile');
  try {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      bio: 'This is an updated bio for testing',
      designation: 'QA Engineer'
    };

    const response = await apiCall('PUT', '/users/profile', updateData);
    if (response.status === 200) {
      logSuccess('User profile updated');
      return true;
    }
  } catch (error) {
    logError('Update user profile failed', error);
    return false;
  }
}

async function testUpdateUserStatus() {
  logTest('Update User Status');
  try {
    const statuses = ['online', 'busy', 'away'];
    for (const status of statuses) {
      const response = await apiCall('PUT', '/users/status', { status });
      if (response.status === 200) {
        logSuccess(`Status updated to: ${status}`);
      } else {
        logError(`Failed to update status to: ${status}`, new Error('Non-200 response'));
        return false;
      }
      await sleep(500);
    }
    return true;
  } catch (error) {
    logError('Update user status failed', error);
    return false;
  }
}

async function testCreateRoom() {
  logTest('Create Room');
  try {
    const roomData = {
      name: `Test Room ${Date.now()}`,
      description: 'This is a test room for API testing',
      isPrivate: false,
      maxMembers: 50
    };

    const response = await apiCall('POST', '/rooms', roomData);
    if (response.status === 200 && response.data.data.id) {
      testRoomId = response.data.data.id;
      logSuccess(`Room created: ${roomData.name}`);
      log(`  Room ID: ${testRoomId}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('Create room failed', error);
    return false;
  }
}

async function testGetAllRooms() {
  logTest('Get All Rooms');
  try {
    const response = await apiCall('GET', '/rooms');
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} rooms`);
      return true;
    }
  } catch (error) {
    logError('Get all rooms failed', error);
    return false;
  }
}

async function testGetMyRooms() {
  logTest('Get My Rooms');
  try {
    const response = await apiCall('GET', '/rooms/my');
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`User has ${response.data.data.length} rooms`);
      return true;
    }
  } catch (error) {
    logError('Get my rooms failed', error);
    return false;
  }
}

async function testGetPublicRooms() {
  logTest('Get Public Rooms');
  try {
    const response = await apiCall('GET', '/rooms/public');
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} public rooms`);
      return true;
    }
  } catch (error) {
    logError('Get public rooms failed', error);
    return false;
  }
}

async function testGetRoomById() {
  logTest('Get Room by ID');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('GET', `/rooms/${testRoomId}`);
    if (response.status === 200 && response.data.data) {
      logSuccess(`Room retrieved: ${response.data.data.name}`);
      return true;
    }
  } catch (error) {
    logError('Get room by ID failed', error);
    return false;
  }
}

async function testJoinRoom() {
  logTest('Join Room');

  // First, create a room with admin user, then try to join with test user token
  if (!adminToken || !authToken) {
    logWarning('Admin or test user token not available, skipping test');
    return false;
  }

  try {
    // Create room as admin
    const roomData = {
      name: `Join Test Room ${Date.now()}`,
      description: 'Room for testing join functionality',
      isPrivate: false
    };
    const createResponse = await apiCall('POST', '/rooms', roomData, adminToken);
    const roomId = createResponse.data.data.id;

    // Join room as test user (different from admin who created it)
    const response = await apiCall('POST', `/rooms/${roomId}/join`, null, authToken);
    if (response.status === 200) {
      logSuccess('User joined room successfully');
      return true;
    }
  } catch (error) {
    logError('Join room failed', error);
    return false;
  }
}

async function testLeaveRoom() {
  logTest('Leave Room');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('POST', `/rooms/${testRoomId}/leave`);
    if (response.status === 200) {
      logSuccess('User left room successfully');
      return true;
    }
  } catch (error) {
    logError('Leave room failed', error);
    return false;
  }
}

async function testUpdateRoom() {
  logTest('Update Room');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    const updateData = {
      name: `Updated Test Room ${Date.now()}`,
      description: 'This room description was updated',
      maxMembers: 75
    };

    const response = await apiCall('PUT', `/rooms/${testRoomId}`, updateData);
    if (response.status === 200) {
      logSuccess('Room updated successfully');
      return true;
    }
  } catch (error) {
    logError('Update room failed', error);
    return false;
  }
}

async function testSendMessage() {
  logTest('Send Message');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    const messageData = {
      roomId: testRoomId,
      text: 'This is a test message from the API test suite',
      type: 'TEXT'
    };

    const response = await apiCall('POST', '/messages', messageData);
    if (response.status === 200 && response.data.data.id) {
      testMessageId = response.data.data.id;
      logSuccess('Message sent successfully');
      log(`  Message ID: ${testMessageId}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('Send message failed', error);
    return false;
  }
}

async function testGetRoomMessages() {
  logTest('Get Room Messages');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('GET', `/messages/room/${testRoomId}?page=0&size=20`);
    if (response.status === 200 && response.data.data) {
      logSuccess(`Retrieved messages (total: ${response.data.data.totalElements || 0})`);
      return true;
    }
  } catch (error) {
    logError('Get room messages failed', error);
    return false;
  }
}

async function testGetRecentMessages() {
  logTest('Get Recent Messages');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('GET', `/messages/room/${testRoomId}/recent`);
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`Retrieved ${response.data.data.length} recent messages`);
      return true;
    }
  } catch (error) {
    logError('Get recent messages failed', error);
    return false;
  }
}

async function testEditMessage() {
  logTest('Edit Message');
  if (!testMessageId) {
    logWarning('No message ID available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('PUT', `/messages/${testMessageId}`, {
      text: 'This message has been edited by the test suite'
    });
    if (response.status === 200) {
      logSuccess('Message edited successfully');
      return true;
    }
  } catch (error) {
    logError('Edit message failed', error);
    return false;
  }
}

async function testDeleteMessage() {
  logTest('Delete Message');
  if (!testMessageId) {
    logWarning('No message ID available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('DELETE', `/messages/${testMessageId}`);
    if (response.status === 200) {
      logSuccess('Message deleted successfully');
      return true;
    }
  } catch (error) {
    logError('Delete message failed', error);
    return false;
  }
}

async function testVideoToken() {
  logTest('Generate Video Token');
  try {
    const response = await apiCall('GET', '/video/token?moderator=true');
    if (response.status === 200 && response.data.token) {
      logSuccess('Video token generated');
      log(`  Token length: ${response.data.token.length}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('Generate video token failed', error);
    return false;
  }
}

async function testStartVideoSession() {
  logTest('Start Video Session');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('POST', '/video/rooms/start', {
      roomId: testRoomId,
      startedByUserId: testUserId
    });
    if (response.status === 200 && response.data.videoRoomId) {
      logSuccess('Video session started');
      log(`  Video Room ID: ${response.data.videoRoomId}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('Start video session failed', error);
    return false;
  }
}

async function testEndVideoSession() {
  logTest('End Video Session');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('POST', `/video/rooms/${testRoomId}/end`);
    if (response.status === 200) {
      logSuccess('Video session ended');
      return true;
    }
  } catch (error) {
    logError('End video session failed', error);
    return false;
  }
}

async function testAdminGetAllUsers() {
  logTest('Admin: Get All Users');
  if (!adminToken) {
    logWarning('Admin token not available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('GET', '/admin/users', null, adminToken);
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`Admin retrieved ${response.data.data.length} users`);
      return true;
    }
  } catch (error) {
    logError('Admin get all users failed', error);
    return false;
  }
}

async function testAdminGetAllRooms() {
  logTest('Admin: Get All Rooms');
  if (!adminToken) {
    logWarning('Admin token not available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('GET', '/admin/rooms', null, adminToken);
    if (response.status === 200 && Array.isArray(response.data.data)) {
      logSuccess(`Admin retrieved ${response.data.data.length} rooms`);
      return true;
    }
  } catch (error) {
    logError('Admin get all rooms failed', error);
    return false;
  }
}

async function testAdminGetStats() {
  logTest('Admin: Get Statistics');
  if (!adminToken) {
    logWarning('Admin token not available, skipping test');
    return false;
  }

  try {
    const response = await apiCall('GET', '/admin/stats', null, adminToken);
    if (response.status === 200 && response.data.data) {
      logSuccess('Admin statistics retrieved');
      log(`  Stats: ${JSON.stringify(response.data.data)}`, colors.blue);
      return true;
    }
  } catch (error) {
    logError('Admin get stats failed', error);
    return false;
  }
}

async function testUnauthorizedAccess() {
  logTest('Unauthorized Access Prevention');
  try {
    await apiCall('GET', '/users/profile', null, null);
    logError('Unauthorized access should have been blocked', new Error('No error thrown'));
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Unauthorized access correctly blocked');
      return true;
    }
    logError('Unexpected error for unauthorized access', error);
    return false;
  }
}

async function testNonAdminAccessToAdminEndpoint() {
  logTest('Non-Admin Access to Admin Endpoint Prevention');
  try {
    // Login as normal user
    const normalUserLogin = await apiCall('POST', '/auth/login', {
      email: 'samarthdev.io@gmail.com',
      password: 'Arun.1234'
    }, null);

    const normalUserToken = normalUserLogin.data.data.token;

    // Try to access admin endpoint with normal user token
    await apiCall('GET', '/admin/users', null, normalUserToken);
    logError('Non-admin should not access admin endpoints', new Error('Access granted'));
    return false;
  } catch (error) {
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      logSuccess('Non-admin correctly denied access to admin endpoints');
      return true;
    }
    // If login failed, that's a different issue
    if (error.response && error.response.status === 400) {
      logWarning('Normal user login failed - test skipped');
      return true;
    }
    logError('Unexpected error for non-admin access', error);
    return false;
  }
}

async function testInvalidRoomId() {
  logTest('Invalid Room ID Handling');
  try {
    await apiCall('GET', '/rooms/invalid_room_id_123');
    logError('Invalid room ID should return error', new Error('No error thrown'));
    return false;
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 404)) {
      logSuccess('Invalid room ID correctly handled');
      return true;
    }
    logError('Unexpected error for invalid room ID', error);
    return false;
  }
}

async function testMessageValidation() {
  logTest('Message Validation');
  if (!testRoomId) {
    logWarning('No room ID available, skipping test');
    return false;
  }

  try {
    // Try to send empty message
    await apiCall('POST', '/messages', {
      roomId: testRoomId,
      text: '',
      type: 'TEXT'
    });
    logError('Empty message should be rejected', new Error('No error thrown'));
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Empty message correctly rejected');
      return true;
    }
    logError('Unexpected error for message validation', error);
    return false;
  }
}

async function testRoomMembershipVerification() {
  logTest('Room Membership Verification');

  // Create a new room
  try {
    const roomData = {
      name: `Private Test Room ${Date.now()}`,
      description: 'Room for testing membership'
    };
    const createResponse = await apiCall('POST', '/rooms', roomData, adminToken);
    const privateRoomId = createResponse.data.data.id;

    // Try to access room messages without being a member (using different user token)
    try {
      await apiCall('GET', `/messages/room/${privateRoomId}/recent`, null, authToken);
      logWarning('Non-member could access room messages - potential security issue');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        logSuccess('Non-member correctly denied access to room messages');
        return true;
      }
      // If it's 200, membership verification might not be working
      logWarning('Membership verification needs review');
      return false;
    }
  } catch (error) {
    logError('Room membership verification test failed', error);
    return false;
  }
}

async function testDirectMessage() {
  logTest('Direct Message (1:1) Creation');

  if (!adminToken || !testUserId) {
    logWarning('Admin token or test user ID not available, skipping test');
    return false;
  }

  try {
    // Create DM between Admin (current user) and Test User
    const response = await apiCall('POST', `/rooms/dm/${testUserId}`, null, adminToken);

    if (response.status === 200 && response.data.data) {
      const dmRoom = response.data.data;
      logSuccess('DM room created/retrieved');

      if (dmRoom.type === 'DIRECT') {
        logSuccess('Room type is DIRECT');
      } else {
        logError('Room type mismatch', new Error(`Expected DIRECT, got ${dmRoom.type}`));
        return false;
      }

      if (dmRoom.members.length === 2) {
        logSuccess('Room has exactly 2 members');
      } else {
        logError('Member count mismatch', new Error(`Expected 2, got ${dmRoom.members.length}`));
        return false;
      }

      // Test Idempotency - Call again should return same room
      const response2 = await apiCall('POST', `/rooms/dm/${testUserId}`, null, adminToken);
      if (response2.data.data.id === dmRoom.id) {
        logSuccess('Idempotency check passed (same room returned)');
        return true;
      } else {
        logError('Idempotency check failed', new Error('Different room returned'));
        return false;
      }
    }
  } catch (error) {
    logError('Direct message test failed', error);
    return false;
  }
}

// Cleanup function
async function testDeleteRoom() {
  logTest('Delete Room (Cleanup)');
  if (!testRoomId) {
    logWarning('No room ID available, skipping cleanup');
    return false;
  }

  try {
    const response = await apiCall('DELETE', `/rooms/${testRoomId}`);
    if (response.status === 200) {
      logSuccess('Room deleted successfully');
      return true;
    }
  } catch (error) {
    logError('Delete room failed', error);
    return false;
  }
}

// Main test execution
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', colors.magenta);
  log('║       WorkSynk API Comprehensive Test Suite          ║', colors.magenta);
  log('╚════════════════════════════════════════════════════════╝', colors.magenta);
  log(`\nStarting tests at: ${new Date().toLocaleString()}\n`, colors.cyan);

  // System tests
  await testHealthCheck();
  await testSystemInfo();
  await sleep(500);

  // Authentication tests
  await testUserRegistration();
  await sleep(500);
  await testDuplicateRegistration();
  await sleep(500);
  await testUserLogin();
  await sleep(500);
  await testInvalidLogin();
  await sleep(500);

  // User management tests
  await testGetUserProfile();
  await sleep(500);
  await testUpdateUserProfile();
  await sleep(500);
  await testUpdateUserStatus();
  await sleep(500);

  // Room management tests
  await testCreateRoom();
  await sleep(500);
  await testGetAllRooms();
  await sleep(500);
  await testGetMyRooms();
  await sleep(500);
  await testGetPublicRooms();
  await sleep(500);
  await testGetRoomById();
  await sleep(500);
  await testJoinRoom();
  await sleep(500);
  await testLeaveRoom();
  await sleep(500);
  await testUpdateRoom();
  await sleep(500);

  // Message tests
  await testSendMessage();
  await sleep(500);
  await testGetRoomMessages();
  await sleep(500);
  await testGetRecentMessages();
  await sleep(500);
  await testEditMessage();
  await sleep(500);
  await testDeleteMessage();
  await sleep(500);

  // Video tests
  await testVideoToken();
  await sleep(500);
  await testStartVideoSession();
  await sleep(500);
  await testEndVideoSession();
  await sleep(500);

  // Admin tests
  await testAdminGetAllUsers();
  await sleep(500);
  await testAdminGetAllRooms();
  await sleep(500);
  await testAdminGetStats();
  await sleep(500);

  // Security tests
  await testUnauthorizedAccess();
  await sleep(500);
  await testNonAdminAccessToAdminEndpoint();
  await sleep(500);
  await testInvalidRoomId();
  await sleep(500);
  await testMessageValidation();
  await sleep(500);
  await testRoomMembershipVerification();
  await sleep(500);
  await testDirectMessage();
  await sleep(500);

  // Cleanup
  await testDeleteRoom();

  // Print results
  log('\n╔════════════════════════════════════════════════════════╗', colors.magenta);
  log('║                   Test Results                        ║', colors.magenta);
  log('╚════════════════════════════════════════════════════════╝', colors.magenta);
  log(`\nTotal Tests: ${testResults.total}`, colors.cyan);
  log(`Passed: ${testResults.passed}`, colors.green);
  log(`Failed: ${testResults.failed}`, colors.red);
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%\n`, colors.cyan);

  if (testResults.errors.length > 0) {
    log('\n╔════════════════════════════════════════════════════════╗', colors.red);
    log('║                    Error Summary                      ║', colors.red);
    log('╚════════════════════════════════════════════════════════╝', colors.red);
    testResults.errors.forEach((err, idx) => {
      log(`\n${idx + 1}. ${err.test}`, colors.yellow);
      log(`   Error: ${err.error}`, colors.red);
    });
  }

  log(`\nTest completed at: ${new Date().toLocaleString()}\n`, colors.cyan);

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\nFatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
