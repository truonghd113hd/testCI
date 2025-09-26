import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const loginSuccessRate = new Rate('login_success_rate');
const responseTime = new Trend('custom_response_time');
const apiCalls = new Counter('api_calls_total');

// Test configurations
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100
    { duration: '3m', target: 500 },   // Ramp up to 500
    { duration: '2m', target: 1000 },  // Ramp to 1000 users
    { duration: '10m', target: 1000 }, // Stay at 1000 users
    { duration: '3m', target: 500 },   // Ramp down to 500
    { duration: '2m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],           // <2% errors
    http_req_duration: ['p(95)<200', 'p(99)<500'], // 95% < 200ms, 99% < 500ms
    login_success_rate: ['rate>0.95'],        // >95% login success
    custom_response_time: ['p(90)<200'],      // 90% < 200ms
    'http_req_duration{endpoint:login}': ['p(95)<200'],
    'http_req_duration{endpoint:profile}': ['p(95)<150'],
    'http_req_duration{endpoint:update_profile}': ['p(95)<300'],
  },
};

// Test data
const users = [
  { email: 'test1@example.com', password: 'password123' },
  { email: 'test2@example.com', password: 'password123' },
  { email: 'loadtest@example.com', password: 'password123' }
];

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Choose random user
  const user = users[Math.floor(Math.random() * users.length)];
  let authToken = '';

  group('Authentication', () => {
    const loginPayload = JSON.stringify({
      email: user.email,
      password: user.password,
    });

    const loginRes = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'login' },
    });

    const loginSuccess = check(loginRes, {
      'login status is 200/201': (r) => r.status === 200 || r.status === 201,
      'login response time < 200ms': (r) => r.timings.duration < 200,
      'login response time < 500ms': (r) => r.timings.duration < 500,
      'has access token': (r) => r.json('access_token') !== undefined,
    });

    loginSuccessRate.add(loginSuccess);
    responseTime.add(loginRes.timings.duration);
    apiCalls.add(1);

    if (loginSuccess && loginRes.json('access_token')) {
      authToken = loginRes.json('access_token');
    }
  });

  if (authToken) {
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    group('User Profile', () => {
      const profileRes = http.get(`${baseUrl}/api/users/me`, {
        headers: authHeaders,
        tags: { endpoint: 'profile' },
      });

      check(profileRes, {
        'profile status is 200': (r) => r.status === 200,
        'profile response time < 150ms': (r) => r.timings.duration < 150,
        'profile has user data': (r) => r.json('id') !== undefined,
      });

      apiCalls.add(1);

      // Test updateMe endpoint
      const updateData = {
        firstName: `LoadTest${Math.floor(Math.random() * 1000)}`,
        lastName: `User${Math.floor(Math.random() * 1000)}`,
        bio: `Updated bio at ${new Date().toISOString()}`,
      };

      const updateRes = http.put(`${baseUrl}/api/users/me`, JSON.stringify(updateData), {
        headers: authHeaders,
        tags: { endpoint: 'update_profile' },
      });

      check(updateRes, {
        'profile update responds': (r) => r.status === 200 || r.status === 400,
        'profile update handled': (r) => r.status !== 500,
        'profile update time < 300ms': (r) => r.timings.duration < 300,
      });

      apiCalls.add(1);
    });
  }

  // Test public endpoints

  sleep(Math.random() * 2 + 1); // Random sleep 1-3 seconds
}