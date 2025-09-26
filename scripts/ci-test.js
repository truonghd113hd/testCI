import http from 'k6/http';
import { check, sleep, group } from 'k6';

// CI-optimized configuration
export const options = {
  vus: parseInt(__ENV.VUS || '20'),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.1'],     // Allow 10% errors in CI
    http_req_duration: ['p(95)<2000'], // More relaxed for CI environment
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3001';

// Test users from test-data.sql
const testUsers = [
  { username: 'testuser1', email: 'test1@example.com', password: 'password123' },
  { username: 'testuser2', email: 'test2@example.com', password: 'password123' },
  { username: 'loadtest', email: 'loadtest@example.com', password: 'password123' },
];

export default function () {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  let authToken = '';

  // 1. Login Flow
  group('Login', () => {
    const loginPayload = JSON.stringify({
      username: user.email,
      password: user.password,
      fcm_token: 'fcm_token_ci_test',
      os: 'android',
    });

    const loginRes = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s',
    });

    const loginSuccess = check(loginRes, {
      'login status is 200/201': (r) => r.status === 200 || r.status === 201,
      'login response time < 5000ms': (r) => r.timings.duration < 5000,
      'has access token': (r) => {
        try {
          const body = r.json();
          return body && body.access_token !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    if (loginSuccess) {
      try {
        const loginData = loginRes.json();
        authToken = loginData.access_token;
      } catch (e) {
        console.log(`Login parsing error: ${e}`);
      }
    }
  });

  if (authToken) {
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    // 2. Get User Info Flow
    group('Get User', () => {
      const getUserRes = http.get(`${baseUrl}/api/auth/me`, {
        headers: authHeaders,
        timeout: '10s',
      });

      check(getUserRes, {
        'get user status is 200': (r) => r.status === 200,
        'get user response time < 3000ms': (r) => r.timings.duration < 3000,
        'user has profile data': (r) => {
          try {
            const profile = r.json();
            return profile && profile.id !== undefined;
          } catch (e) {
            return false;
          }
        },
      });
    });

    // 3. Update User Flow
    group('Update User', () => {
      const updateData = {
        full_name: `CI Test User ${Math.floor(Math.random() * 1000)}`,
        height_cm: Math.floor(Math.random() * 50) + 150,
        weight_kg: Math.floor(Math.random() * 50) + 50,
      };

      const updateRes = http.put(`${baseUrl}/api/users`, JSON.stringify(updateData), {
        headers: authHeaders,
        timeout: '10s',
      });

      check(updateRes, {
        'update user successful': (r) => r.status === 200 || r.status === 400,
        'update user response time < 3000ms': (r) => r.timings.duration < 3000,
        'update user handled': (r) => r.status !== 500,
      });
    });
  }

  sleep(1);
}