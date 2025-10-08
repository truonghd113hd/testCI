import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  timeout: '60s',
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  console.log('🔍 Testing server connectivity...');
  
  // Test basic connectivity
  for (let i = 0; i < 20; i++) {
    console.log(`Attempt ${i + 1}: Testing ${baseUrl}/`);
    
    try {
      const res = http.get(`${baseUrl}/`, {
        timeout: '10s',
      });
      
      console.log(`Response status: ${res.status}`);
      console.log(`Response time: ${res.timings.duration}ms`);
      
      if (res.status === 200 || res.status === 404) {
        console.log('✅ Server is responding!');
        
        // Test API endpoint
        console.log('Testing API health endpoint...');
        const healthRes = http.get(`${baseUrl}/api/health`, {
          timeout: '10s',
        });
        
        console.log(`Health endpoint status: ${healthRes.status}`);
        
        return { serverReady: true };
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
    
    sleep(3);
  }
  
  throw new Error('❌ Server is not responding after multiple attempts');
}

export default function () {
  // Simple connectivity test
  const res = http.get(`${baseUrl}/`, {
    timeout: '30s',
  });
  
  check(res, {
    'server is responding': (r) => r.status === 200 || r.status === 404,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });
  
  console.log(`Status: ${res.status}, Time: ${res.timings.duration}ms`);
  
  sleep(1);
}