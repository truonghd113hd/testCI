import http from 'k6/http';
import { check, sleep } from 'k6';

// Cloud test configuration
export const options = {
  cloud: {
    distribution: {
      'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 50 },
      'amazon:ie:dublin': { loadZone: 'amazon:ie:dublin', percent: 50 },
    },
    apm: [
      {
        provider: 'newrelic',
        accountId: __ENV.NEW_RELIC_ACCOUNT_ID,
        apiKey: __ENV.NEW_RELIC_API_KEY,
      },
    ],
  },
  stages: [
    { duration: '5m', target: 100 },
    { duration: '10m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '10m', target: 200 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1500'],
    'http_req_duration{status:200}': ['p(99)<2000'],
  },
};

const baseUrl = __ENV.BASE_URL || 'https://api.yourdomain.com';

export default function () {
  const responses = http.batch([
    ['GET', `${baseUrl}/api/health`],
    ['GET', `${baseUrl}/api/status`],
    ['GET', `${baseUrl}/api/metrics`],
  ]);

  for (let i = 0; i < responses.length; i++) {
    check(responses[i], {
      [`request ${i} status is 200`]: (r) => r.status === 200,
    });
  }

  sleep(Math.random() * 3 + 1);
}