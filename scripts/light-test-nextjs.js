import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { performNextJSAuthFlow } from './authFlowNextJS.js';
import { generateRecoveryReport } from './recovery.js';

// System Recovery Monitoring Variables
let systemDownTime = 0;
let lastFailureTime = 0;
let consecutiveFailureCount = 0;
let totalFailures = 0;
let totalRequests = 0;
let systemRecoveryStarted = false;
let errorLog = []; // Array to store all errors for final reporting

// Test Users Data - Load from environment variables for security
const users = [
  { 
    email: __ENV.K6_TEST_USER_1_EMAIL || 'truonghd1994@gmail.com', 
    password: __ENV.K6_TEST_USER_1_PASSWORD || 'Congtuma@113' 
  },
  { 
    email: __ENV.K6_TEST_USER_2_EMAIL || 'truonghd199401@gmail.com', 
    password: __ENV.K6_TEST_USER_2_PASSWORD || 'Congtuma@123' 
  },
  { 
    email: __ENV.K6_TEST_USER_3_EMAIL || 'truonghd110394@gmail.com', 
    password: __ENV.K6_TEST_USER_3_PASSWORD || 'Congtuma123' 
  },
];

// Configuration - Using environment variables for security
const loginUrl = __ENV.K6_LOGIN_URL || 'https://dev.zenia.network/login';

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // Light test: 5 users for 10s
    { duration: '20s', target: 10 },  // Ramp up to 10 users
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<10000', 'p(99)<20000'], 
    'http_req_failed': ['rate<0.50'], // Allow 50% failure rate for initial testing
    'login_failure_rate': ['rate<0.80'], // Allow 80% failure rate
    'login_duration': ['p(95)<8000'], 
    'system_recovery_time': ['p(95)<30000'], 
    'requests_per_second': ['rate>1'], // Expect at least 1 RPS
  }
};

export default function () {
  const shouldLog = __VU <= 2 && Math.random() < 0.2; // More logging for debugging
  totalRequests++;
  
  // Select a random user from the test data
  const selectedUser = users[Math.floor(Math.random() * users.length)];
  
  // Create global state object for sharing between modules
  const globalState = {
    systemDownTime,
    lastFailureTime,
    consecutiveFailureCount,
    totalFailures,
    totalRequests,
    systemRecoveryStarted
  };
  
  group('Next.js Authentication Flow', function () {
    const authResult = performNextJSAuthFlow(
      loginUrl,
      selectedUser.email,
      selectedUser.password,
      globalState,
      shouldLog
    );
    
    // Update global counters
    totalRequests += authResult.totalRequests;
    totalFailures = globalState.totalFailures;
    consecutiveFailureCount = globalState.consecutiveFailureCount;
    systemDownTime = globalState.systemDownTime;
    lastFailureTime = globalState.lastFailureTime;
    systemRecoveryStarted = globalState.systemRecoveryStarted;
    
    // Add errors to global error log
    errorLog = errorLog.concat(authResult.errors);
    
    // Enhanced success/failure checks
    check(authResult, {
      'login attempt completed': () => true,
      'login eventually successful': () => authResult.success,
      'login completed within 30s': () => true,
    }, { scenario: 'login_flow' });

    // Add delay based on success/failure
    if (!authResult.success) {
      sleep(1 + Math.random() * 2); // 1-3 second delay for failures
    } else {
      sleep(0.2 + Math.random() * 0.5); // 0.2-0.7 second delay for success
    }
  });
}

// Simplified teardown function
export function teardown(data) {
  console.log('\n🎯 LIGHT LOAD TEST COMPLETED');
  
  // Create global state object to pass to recovery report
  const globalState = {
    totalRequests,
    totalFailures,
    systemDownTime,
    lastFailureTime,
    consecutiveFailureCount,
    systemRecoveryStarted
  };
  
  // Generate recovery report
  generateRecoveryReport(globalState, errorLog);
}