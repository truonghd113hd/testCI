import http from 'k6/http';
import { check, sleep } from 'k6';
import {
  failureRate,
  recoveryTime,
  loginTime,
  rps,
  error404Counter,
  error401Counter,
  error403Counter,
  error5xxCounter,
  errorNetworkCounter,
  errorOtherCounter,
  errorInvalidContentCounter,
} from './metrics.js';

/**
 * Performs Next.js Server Action authentication flow
 * @param {string} loginUrl - URL for login
 * @param {string} userEmail - User email
 * @param {string} userPassword - User password
 * @param {object} globalState - Global state object with monitoring variables
 * @param {boolean} shouldLog - Whether to log debug information
 * @returns {object} Authentication result with success status and metrics
 */
export function performNextJSAuthFlow(loginUrl, userEmail, userPassword, globalState, shouldLog) {
  const startTime = Date.now();
  let authResult = {
    success: false,
    totalRequests: 0,
    errors: [],
  };

  // Step 1: GET login page to extract cookies and session data
  if (shouldLog) {
    console.log(`🌐 Step 1: Getting login page for session setup`);
  }

  const loginPageRes = http.get(loginUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
    },
    tags: { name: 'login_page_setup' },
    responseCallback: http.expectedStatuses(401), // Expected 401, don't count as failure
  });

  authResult.totalRequests++;

  if (shouldLog) {
    console.log(`📊 Login page response: Status ${loginPageRes.status}, Time: ${loginPageRes.timings.duration}ms`);
  }

  // Extract cookies from page response
  const cookies = loginPageRes.cookies || {};
  let cookieHeader = '';
  for (let name in cookies) {
    cookieHeader += `${name}=${cookies[name][0].value}; `;
  }

  if (shouldLog) {
    console.log(`🍪 Cookies extracted: ${cookieHeader ? 'Yes' : 'No'} (${cookieHeader.length} chars)`);
  }

  // Step 2: Perform Next.js Server Action login
  if (shouldLog) {
    console.log(`🔐 Step 2: Performing Next.js Server Action login`);
  }

  const loginPayload = JSON.stringify([userEmail, userPassword]);

  const loginResponse = http.post(loginUrl, loginPayload, {
    headers: {
      Accept: 'text/x-component',
      'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
      Authorization: 'Basic YXBlYy1hZG1pbjppcXVqZGZzamRmeDk=', // Working auth from test
      'Content-Type': 'text/plain;charset=UTF-8',
      'Next-Action': '7fb96c047931578a3376831220b53ae65fd6500c5c',
      'Next-Router-State-Tree':
        '%5B%22%22%2C%7B%22children%22%3A%5B%22(login-template)%22%2C%7B%22children%22%3A%5B%22login%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
      Priority: 'u=1, i',
      'Sec-Ch-Ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      Referer: loginUrl,
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      Cookie: cookieHeader.trim(),
    },
    tags: { name: 'login_action' },
    responseCallback: http.expectedStatuses(200, 302), // Only 200/302 are success
  });

  authResult.totalRequests++;

  if (shouldLog) {
    console.log(`📊 Login response: Status ${loginResponse.status}, Time: ${loginResponse.timings.duration}ms`);
    console.log(`📝 Response preview: ${loginResponse.body ? loginResponse.body.substring(0, 100) + '...' : 'empty'}`);
  }

  // Determine success based on status code and response
  const success = loginResponse.status === 200 || loginResponse.status === 302;
  authResult.success = success;

  // Record metrics
  const endTime = Date.now();
  const duration = endTime - startTime;
  loginTime.add(duration);

  if (success) {
    if (shouldLog) {
      console.log(`✅ Login successful after ${authResult.totalRequests} requests in ${duration}ms`);
    }

    // Nếu hệ thống đang trong trạng thái phục hồi, tính thời gian phục hồi
    if (globalState.systemRecoveryStarted) {
      const recoveryDuration = Date.now() - globalState.lastFailureTime;
      recoveryTime.add(recoveryDuration); // Ghi metric
      globalState.systemDownTime += recoveryDuration;

      if (shouldLog) {
        console.log(`🔄 System recovered after ${recoveryDuration}ms`);
      }

      // Log sự kiện phục hồi vào errorLog
      authResult.errors.push({
        timestamp: new Date().toISOString(),
        vu: __VU,
        event: 'System recovered',
        recoveryDuration: recoveryDuration,
      });

      // Reset trạng thái phục hồi
      globalState.systemRecoveryStarted = false;
    }

    // Record success for failure rate metric
    failureRate.add(0);
    
    // Reset đếm lỗi
    globalState.consecutiveFailureCount = 0;
  } else {
    if (shouldLog) {
      console.log(`❌ Login failed with status ${loginResponse.status}`);
    }

    // Ghi failure
    failureRate.add(1);
    globalState.totalFailures++;
    globalState.consecutiveFailureCount++;

    // Nếu đây là lỗi đầu tiên trong chuỗi, ghi thời gian bắt đầu downtime
    if (!globalState.systemRecoveryStarted) {
      globalState.lastFailureTime = Date.now();
      globalState.systemRecoveryStarted = true;
    }

    // Log chi tiết lỗi
    globalState.lastFailureTime = Date.now();
    authResult.errors.push({
      timestamp: new Date().toISOString(),
      vu: __VU,
      error: `Login failed (${loginResponse.status})`,
      status: loginResponse.status,
      responsePreview: loginResponse.body ? loginResponse.body.substring(0, 200) : 'empty',
    });

    // Count theo loại lỗi
    if (loginResponse.status === 401) error401Counter.add(1);
    else if (loginResponse.status === 403) error403Counter.add(1);
    else if (loginResponse.status === 404) error404Counter.add(1);
    else if (loginResponse.status >= 500) error5xxCounter.add(1);
    else if (loginResponse.status === 0) errorNetworkCounter.add(1);
    else errorOtherCounter.add(1);
  }


  // Record requests per second
  rps.add(authResult.totalRequests);

  return authResult;
}

// Keep the old function for backward compatibility but mark as deprecated
export function performAuthFlow(loginPageUrl, loginPostUrl, basicAuth, globalState, shouldLog) {
  console.log('⚠️ Warning: performAuthFlow is deprecated, use performNextJSAuthFlow instead');

  // Extract email and password from basicAuth (this is a fallback)
  const userEmail = 'truonghd1994@gmail.com';
  const userPassword = 'Congtuma@113';

  return performNextJSAuthFlow(loginPageUrl, userEmail, userPassword, globalState, shouldLog);
}
