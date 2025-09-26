import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,         // Số lượng user đồng thời
  duration: '60s',   // Thời gian test
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% request lỗi
    http_req_duration: ['p(95)<500'], // 95% req < 500ms
  },
};

export default function () {
  // Test login
  const loginPayload = JSON.stringify({
    username: 'truonghd1994@gmail.com',
    password: 'congtuma123',
  });
  const loginHeaders = { 'Content-Type': 'application/json' };
  const loginRes = http.post('http://localhost:3000/api/auth/login', loginPayload, { headers: loginHeaders });
  check(loginRes, {
    'login status 201': (r) => r.status === 201,
    'login has token': (r) => r.json('access_token') !== undefined,
  });

  sleep(1);
}
