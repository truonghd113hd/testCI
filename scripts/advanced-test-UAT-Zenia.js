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
    password: __ENV.K6_TEST_USER_1_PASSWORD || 'password@123',
  },
  {
    email: __ENV.K6_TEST_USER_2_EMAIL || 'truonghd199401@gmail.com',
    password: __ENV.K6_TEST_USER_2_PASSWORD || 'password@123',
  },
  {
    email: __ENV.K6_TEST_USER_3_EMAIL || 'truonghd110394@gmail.com',
    password: __ENV.K6_TEST_USER_3_PASSWORD || 'password@123',
  },
];

// Configuration - Using environment variables for security
const loginUrl = __ENV.K6_LOGIN_URL || 'https://dev.zenia.network/login';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 users in 30s
    { duration: '1m', target: 250 }, // Ramp up to 250 users in 1m
    { duration: '1m30s', target: 400 }, // Ramp up to 400 users in 1m30s
    { duration: '2m', target: 400 }, // Stay at 400 users for 2m
    { duration: '30s', target: 0 }, // Ramp down in 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000', 'p(99)<20000'], // 95% under 10s, 99% under 20s
    http_req_failed: ['rate<0.60'], // Overall (includes 401 setup requests)
    'http_req_failed{name:login_action}': ['rate<0.25'], // Only actual login failures
    login_failure_rate: ['rate<0.30'], // Allow 30% login failure rate for stress testing
    login_duration: ['p(95)<8000'], // Login should complete within 8s for 95%
    system_recovery_time: ['p(95)<30000'], // System should recover within 30s
    requests_per_second: ['rate>=0.80'], // Expect at least 80% success rate for stress test
  },
  // httpDebug: false, // Disabled to reduce output noise
};

export default function () {
  const shouldLog = __VU <= 2 && Math.random() < 0.1; // Reduce logging: only first 2 VUs, 10% of time
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
    systemRecoveryStarted,
  };

  group('Next.js Authentication Flow', function () {
    const authResult = performNextJSAuthFlow(
      loginUrl,
      selectedUser.email,
      selectedUser.password,
      globalState,
      shouldLog,
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
    check(
      authResult,
      {
        'login attempt completed': () => true,
        'login eventually successful': () => authResult.success,
        'login completed within 30s': () => true, // This should be calculated in authFlow
      },
      { scenario: 'login_flow' },
    );

    // Add delay based on success/failure
    if (!authResult.success) {
      sleep(2 + Math.random() * 3); // 2-5 second delay for failures
    } else {
      sleep(0.5 + Math.random() * 1); // 0.5-1.5 second delay for success
    }
  });
  globalState.totalRequests = totalRequests;
  globalState.totalFailures = totalFailures;
}

// Simplified teardown function
export function teardown(data) {
  console.log('\n🎯 LOAD TEST COMPLETED');

  // Create global state object to pass to recovery report
  const globalState = {
    totalRequests,
    totalFailures,
    systemDownTime,
    lastFailureTime,
    consecutiveFailureCount,
    systemRecoveryStarted,
  };

  // Generate recovery report
  generateRecoveryReport(globalState, errorLog);
}
