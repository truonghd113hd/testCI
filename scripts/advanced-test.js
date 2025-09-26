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
    { duration: '30s', target: 100 },  // Ramp up to 100 (30s)
    { duration: '1m', target: 500 },   // Ramp up to 500 (1 min)
    { duration: '30s', target: 1000 }, // Ramp to 1000 users (30s)
    { duration: '2m', target: 1000 },  // Stay at 1000 users (2 min)
    { duration: '30s', target: 500 },  // Ramp down to 500 (30s)
    { duration: '30s', target: 0 },    // Ramp down to 0 (30s)
  ], // Total: 5 minutes exactly
  thresholds: {
    http_req_failed: ['rate<0.02'],           // <2% errors
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1000ms
    login_success_rate: ['rate>0.95'],        // >95% login success
    custom_response_time: ['p(90)<500'],      // 90% < 500ms
    'http_req_duration{endpoint:login}': ['p(95)<500'],
    'http_req_duration{endpoint:profile}': ['p(95)<400'],
    'http_req_duration{endpoint:update_profile}': ['p(95)<600'],
  },
};

// Test data
const users = [
  { email: 'truonghd1994+1@gmail.com', password: '123' },
  { email: 'truonghd1994+2@gmail.com', password: '123' },
  { email: 'truonghd1994+3@gmail.com', password: '123' },
  { email: 'truonghd1994+4@gmail.com', password: '123' },
  { email: 'truonghd1994+5@gmail.com', password: '123' },
  { email: 'truonghd1994+6@gmail.com', password: '123' },
  { email: 'truonghd1994+7@gmail.com', password: '123' },
  { email: 'truonghd1994+8@gmail.com', password: '123' },
  { email: 'truonghd1994+9@gmail.com', password: '123' },
];

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

// Setup function to check if server is ready
export function setup() {
  console.log('🚀 Checking if server is ready...');
  
  // Wait for server to be ready
  for (let i = 0; i < 30; i++) {
    try {
      const res = http.get(`${baseUrl}/`, {
        timeout: '10s',
      });
      
      if (res.status === 200 || res.status === 404) {
        console.log(`✅ Server is ready! Status: ${res.status}`);
        return { serverReady: true };
      }
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}: Server not ready, waiting... (${error})`);
    }
    
    sleep(2); // Wait 2 seconds between attempts
  }
  
  throw new Error('❌ Server failed to start within timeout period');
}

export default function () {
  // Choose random user
  const user = users[Math.floor(Math.random() * users.length)];
  let authToken = '';

  group('Authentication', () => {
    const loginPayload = JSON.stringify({
      username: user.email,
      password: user.password,
      fcm_token: 'fcm_token_123456',
      os: 'android',
    });

    const loginRes = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'login' },
      timeout: '30s', // 30 second timeout for login
    });

    // Debug response if needed
    if (loginRes.status !== 200 && loginRes.status !== 201) {
      console.log(`Login failed. Status: ${loginRes.status}, Body: ${loginRes.body}`);
    }

    const loginSuccess = check(loginRes, {
      'login status is 200/201': (r) => r.status === 200 || r.status === 201,
      'login response time < 200ms': (r) => r.timings.duration < 200,
      'login response time < 500ms': (r) => r.timings.duration < 500,
      'has access token': (r) => {
        try {
          const body = r.json();
          return body && body.access_token !== undefined;
        } catch (e) {
          console.log(`JSON parse error: ${e}, Response: ${r.body}`);
          return false;
        }
      },
    });

    loginSuccessRate.add(loginSuccess);
    responseTime.add(loginRes.timings.duration);
    apiCalls.add(1);

    if (loginSuccess) {
      try {
        const loginData = loginRes.json();
        if (loginData && loginData.access_token) {
          authToken = loginData.access_token;
        }
      } catch (e) {
        console.log(`Error parsing login response: ${e}`);
      }
    }
  });

  if (authToken) {
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    group('User Profile', () => {
      const profileRes = http.get(`${baseUrl}/api/auth/me`, {
        headers: authHeaders,
        tags: { endpoint: 'profile' },
        timeout: '20s', // 20 second timeout for profile
      });

      check(profileRes, {
        'profile status is 200': (r) => r.status === 200,
        'profile response time < 150ms': (r) => r.timings.duration < 150,
        'profile has user data': (r) => {
          try {
            const profile = r.json();
            return profile && profile.id !== undefined;
          } catch (e) {
            console.log(`Profile JSON parse error: ${e}, Response: ${r.body}`);
            return false;
          }
        },
      });

      apiCalls.add(1);

      // Test updateMe endpoint
      const updateData = {
        full_name: `TestUser${Math.floor(Math.random() * 1000)}`,
        height_cm: Math.floor(Math.random() * 50) + 150,
        weight_kg: Math.floor(Math.random() * 50) + 50,
      };

      const updateRes = http.put(`${baseUrl}/api/users`, JSON.stringify(updateData), {
        headers: authHeaders,
        tags: { endpoint: 'update_profile' },
        timeout: '25s', // 25 second timeout for update
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