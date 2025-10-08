import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ---------- Custom metrics ----------
const loginSuccessRate = new Rate('login_success_rate');
const responseTime = new Trend('custom_response_time');
const apiCalls = new Counter('api_calls_total');
const systemRecoveryTime = new Trend('system_recovery_time');
const consecutiveFailures = new Counter('consecutive_failures_total');
const recoveryEvents = new Counter('recovery_events_total');

// ---------- Configuration (600 VU, conservative distribution) ----------
export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '1m', target: 250 },
    { duration: '2m', target: 400 },
    { duration: '1m', target: 600 }, // Peak 600 VUs
    { duration: '3m', target: 600 }, // Hold at 600 VUs for longer to observe stability
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.5'], // Allow some failures for server-actions under heavy load
    http_req_duration: ['p(95)<45000'], // 95% < 45s
    login_success_rate: ['rate>0.25'], // Target >= 25% success under stress
    custom_response_time: ['p(90)<35000'],
    system_recovery_time: ['p(95)<120000'],
    consecutive_failures_total: ['count<2000'],
    'http_req_duration{endpoint:login}': ['p(95)<45000'],
    'http_req_duration{endpoint:profile}': ['p(95)<8000'],
  },
  // Reduce k6 internal verbosity by default
  discardResponseBodies: false,
};

// ---------- Test data ----------
const users = [
  { email: 'truonghd1994@gmail.com', password: 'Congtuma@113' },
  { email: 'truonghd199401@gmail.com', password: 'Congtuma@123' },
  { email: 'truonghd110394@gmail.com', password: 'Congtuma123' },
];

const baseUrl = __ENV.BASE_URL || 'https://api.dev.zenia.network/api/v1';
const loginPageUrl = __ENV.LOGIN_URL || 'https://dev.zenia.network/login';
const DEBUG = (__ENV.DEBUG || 'false') === 'true'; // Set DEBUG=true to enable logs

// ---------- Lightweight system recovery tracking (works across VUs within a worker) ----------
let systemDownStartTime = null;
let consecutiveFailureCount = 0;
let lastSuccessTime = Date.now();
let isSystemDown = false;

export function setup() {
  if (DEBUG) {
    console.log('DEBUG: Setup - System recovery monitoring enabled');
  }
  return { serverReady: true };
}

export default function () {
  // Pick a rotating user per VU
  const user = users[(__VU - 1) % users.length];

  let authToken = null;

  // Minimal logging to prevent IO bottleneck
  const shouldLog = DEBUG && (__VU <= 5 || __ITER % 50 === 0);

  // Spread VUs quickly but with small offset
  sleep((__VU % 20) * 0.05 + Math.random() * 0.3);

  group('Authentication', () => {
    if (shouldLog) console.log(`AUTH [VU:${__VU} ITER:${__ITER}] ${user.email}`);

    // Use a small session rotation to reduce identical requests
    const sessionPool = ['7fb9...c5c', '8gb9...c6d', '9hb9...c7e'];
    const nextActionId = sessionPool[__VU % sessionPool.length];
    const nextRouterState = '%5B%22%22%2C%7B...%7D%5D';
    const cookies = `session_${__VU}=1; path=/`;

    const loginPayload = JSON.stringify([user.email, user.password]);

    let loginRes = null;
    let attempts = 0;
    const maxAttempts = 3; // reduced for stability

    // Simple exponential backoff with capped delay
    do {
      attempts++;
      if (attempts > 1) {
        const delay = Math.min(Math.pow(2, attempts - 1) + Math.random() * 0.5, 8); // 2s, ~3.5s, cap 8s
        sleep(delay);
        if (shouldLog) console.log(`Retry ${attempts} delay ${delay.toFixed(2)}s`);
      }

      // Deterministic UA selection to reduce entropy
      const userAgents = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36',
      ];
      const ua = userAgents[__VU % userAgents.length];

      const timeoutMs = 25000 + attempts * 8000; // 25s, 33s, 41s

      loginRes = http.post(loginPageUrl, loginPayload, {
        headers: {
          accept: 'text/x-component',
          'content-type': 'text/plain;charset=UTF-8',
          'next-action': nextActionId,
          'next-router-state-tree': nextRouterState,
          referer: loginPageUrl,
          cookie: cookies,
          'user-agent': ua,
          connection: 'keep-alive',
        },
        tags: { endpoint: 'login' },
        timeout: `${timeoutMs}ms`,
      });
    } while (loginRes.status !== 200 && loginRes.status !== 201 && attempts < maxAttempts);

    const success = loginRes && (loginRes.status === 200 || loginRes.status === 201);
    const now = Date.now();

    // Basic recovery tracking (best-effort within single worker)
    if (success) {
      if (isSystemDown && systemDownStartTime) {
        const recoveryTime = now - systemDownStartTime;
        systemRecoveryTime.add(recoveryTime);
        recoveryEvents.add(1);
        if (shouldLog) console.log(`RECOVERY: ${(recoveryTime / 1000).toFixed(1)}s`);
        isSystemDown = false;
        systemDownStartTime = null;
        consecutiveFailureCount = 0;
      }
      lastSuccessTime = now;
    } else {
      consecutiveFailureCount++;
      consecutiveFailures.add(1);
      if (consecutiveFailureCount >= 3 && !isSystemDown) {
        isSystemDown = true;
        systemDownStartTime = now;
        if (shouldLog) console.log('POTENTIAL SYSTEM DOWN - tracking start');
      }
      // soft cooldown after failures
      sleep(1 + Math.random() * 1.5);
    }

    // Log limited error info
    if (!success && shouldLog) {
      console.log(`LOGIN FAIL: status=${loginRes ? loginRes.status : 'no-response'}`);
    }

    // Checks and metrics
    const checks = check(loginRes, {
      'login status 200/201': (r) => r && (r.status === 200 || r.status === 201),
      'login response < 8s': (r) => r && r.timings && r.timings.duration < 8000,
    });

    loginSuccessRate.add(checks);
    responseTime.add(loginRes ? loginRes.timings.duration : 0);
    apiCalls.add(1);

    if (!checks) return; // Stop here if login didn't pass

    // Try to extract token in a lightweight, defensive way
    try {
      let token = null;
      if (loginRes && loginRes.body && loginRes.body.indexOf('accessToken') !== -1) {
        const m = loginRes.body.match(/"accessToken"\s*:\s*"([^"]+)"/);
        if (m && m[1]) token = m[1];
      }
      authToken = token;
      if (!authToken) {
        if (shouldLog) console.log('No token extracted - skipping profile');
        return;
      }
    } catch (e) {
      if (shouldLog) console.log('Token parse error');
      return;
    }
  });

  // Profile call
  if (authToken) {
    const headers = { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' };
    group('User Profile', () => {
      const res = http.get(`${baseUrl}/users/info/me`, { headers, tags: { endpoint: 'profile' }, timeout: '20000ms' });
      apiCalls.add(1);
      if (DEBUG && __VU <= 3) console.log(`PROFILE ${res.status} ${res.timings.duration}ms`);
      check(res, {
        'profile status 200': (r) => r && r.status === 200,
      });
    });
  }

  // Controlled sleep to avoid bursts but keep steady pressure
  const baseSleep = 5.0; // seconds
  const jitter = Math.random() * 1.2;
  const failurePenalty = authToken ? 0 : 2.0;
  sleep(baseSleep + jitter + failurePenalty + (__VU % 10) * 0.05);
}

export function teardown(data) {
  if (DEBUG) console.log('DEBUG: Teardown - test finished');
}
