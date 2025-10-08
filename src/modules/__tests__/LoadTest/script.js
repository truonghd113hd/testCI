import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

// Mock test data
const mockUsers = [
  { username: 'testuser1', email: 'test1@example.com', password: 'password123' },
  { username: 'testuser2', email: 'test2@example.com', password: 'password123' },
  { username: 'loadtest', email: 'loadtest@example.com', password: 'password123' },
];

export default function () {
  const baseUrl = 'http://localhost:3001';

  // 1. Test login with mock user data
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const loginRes = http.post(
    `${baseUrl}/api/auth/login`,
    JSON.stringify({
      username: randomUser.username,
      password: randomUser.password,
      fcm_token: 'fcm_token_123456',
      os: 'android',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(loginRes, {
    'login successful': (r) => r.status === 200 || r.status === 201,
    'login has token': (r) => r.json('access_token') !== undefined,
  });

  let authToken = '';
  if (loginRes.status === 200 || loginRes.status === 201) {
    authToken = loginRes.json('access_token');
  }

  // 2. Test authenticated endpoints
  if (authToken) {
    const authHeaders = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    // Test get user profile
    const profileRes = http.get(`${baseUrl}/api/auth/me`, { headers: authHeaders });
    check(profileRes, {
      'profile fetch ok': (r) => r.status === 200,
      'profile has user data': (r) => r.json('username') !== undefined,
    });

    // Test update user profile
    const updateData = {
      full_name: `TestUser${Math.floor(Math.random() * 1000)}`,
      height_cm: Math.floor(Math.random() * 50) + 150,
      weight_kg: Math.floor(Math.random() * 50) + 50,
    };

    const updateRes = http.put(`${baseUrl}/api/users`, JSON.stringify(updateData), { headers: authHeaders });
    check(updateRes, {
      'profile update responds': (r) => r.status === 200 || r.status === 400,
      'profile update no server error': (r) => r.status !== 500,
      'profile update has response': (r) => r.body.length > 0,
    });
  }

  sleep(1);
}
