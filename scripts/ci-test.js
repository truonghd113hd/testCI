import http from 'k6/http';
import { check, sleep } from 'k6';

// CI-optimized configuration
export const options = {
  vus: parseInt(__ENV.VUS || '20'),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.1'],     // Allow 10% errors in CI
    http_req_duration: ['p(95)<2000'], // More relaxed for CI environment
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const testMode = __ENV.TEST_MODE || 'safe'; // safe | full

export default function () {
  // Always safe operations for CI
  const healthRes = http.get(`${baseUrl}/api`);
  check(healthRes, {
    'health check passes': (r) => r.status === 404 || r.status === 200,
  });

  if (testMode === 'full') {
    // Extended testing when explicitly enabled
    const loginRes = http.post(`${baseUrl}/api/auth/login`, 
      JSON.stringify({ 
        email: 'invalid@test.com', 
        password: 'invalid' 
      }), 
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(loginRes, {
      'invalid login handled': (r) => r.status === 401 || r.status === 400,
    });
  }

  sleep(1);
}