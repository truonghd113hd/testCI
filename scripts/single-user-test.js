import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Simple test configuration - 1 user, 1 iteration
export const options = {
  vus: 1, // 1 virtual user
  iterations: 1, // Run only 1 time
  thresholds: {
    'http_req_duration': ['p(95)<30000'], // Allow up to 30s for response
    'http_req_failed': ['rate<1'], // Allow 100% failure for debugging
  }
};

// Test Users Data - Load from environment variables
const users = [
  { 
    email: __ENV.K6_TEST_USER_1_EMAIL || 'truonghd1994@gmail.com', 
    password: __ENV.K6_TEST_USER_1_PASSWORD || 'Congtuma@113' 
  },
];

// Configuration
const loginUrl = __ENV.K6_LOGIN_URL || 'https://dev.zenia.network/login';

export default function () {
  console.log('🧪 Starting single user test...');
  
  // Use first user for testing
  const selectedUser = users[0];
  console.log(`👤 Testing with user: ${selectedUser.email}`);
  
  group('Next.js Server Action Login Test', function () {
    console.log('� Starting Next.js Server Action login...');
    
    // Step 1: Get login page first to extract any needed tokens/cookies
    console.log('📄 Step 1: Getting login page...');
    const pageResponse = http.get(loginUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
      }
    });
    
    console.log(`📊 Page response: Status ${pageResponse.status}, Time: ${pageResponse.timings.duration}ms`);
    
    // Extract cookies from page response
    const cookies = pageResponse.cookies || {};
    let cookieHeader = '';
    for (let name in cookies) {
      cookieHeader += `${name}=${cookies[name][0].value}; `;
    }
    
    console.log(`🍪 Cookies: ${cookieHeader ? 'Yes' : 'No'}`);
    
    // Step 2: Perform Next.js Server Action login
    console.log('🚀 Step 2: Performing Server Action login...');
    
    const loginPayload = JSON.stringify([selectedUser.email, selectedUser.password]);
    
    const loginResponse = http.post(loginUrl, loginPayload, {
      headers: {
        'Accept': 'text/x-component',
        'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
        'Authorization': 'Basic YXBlYy1hZG1pbjppcXVqZGZzamRmeDk=', // From your example
        'Content-Type': 'text/plain;charset=UTF-8',
        'Next-Action': '7fb96c047931578a3376831220b53ae65fd6500c5c',
        'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22(login-template)%22%2C%7B%22children%22%3A%5B%22login%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
        'Priority': 'u=1, i',
        'Sec-Ch-Ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Referer': loginUrl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Cookie': cookieHeader.trim()
      }
    });
    
    console.log(`📊 Login response: Status ${loginResponse.status}, Time: ${loginResponse.timings.duration}ms`);
    console.log(`📝 Response body preview: ${loginResponse.body ? loginResponse.body.substring(0, 200) : 'empty'}`);
    
    // Check results
    const success = loginResponse.status === 200 || loginResponse.status === 302;
    
    check(loginResponse, {
      'login page accessible': () => pageResponse.status === 200 || pageResponse.status === 401,
      'login request completed': () => loginResponse.status !== 0,
      'login successful (200 or 302)': () => success,
      'response time < 30s': () => loginResponse.timings.duration < 30000,
    });
    
    if (success) {
      console.log('🎉 Login successful!');
    } else {
      console.log(`⚠️ Login failed with status ${loginResponse.status}`);
      console.log(`Error details: ${loginResponse.body}`);
    }
    
    return {
      success: success,
      status: loginResponse.status,
      body: loginResponse.body
    };
  });
  
  console.log('✅ Single user test completed');
}

export function teardown(data) {
  console.log('\n🎯 SINGLE USER TEST COMPLETED');
}