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
  errorInvalidContentCounter
} from './metrics.js';

/**
 * Performs complete authentication flow: GET login page + POST login
 * @param {string} loginPageUrl - URL for login page
 * @param {string} loginPostUrl - URL for login POST
 * @param {string} basicAuth - Basic auth header value
 * @param {object} globalState - Global state object with monitoring variables
 * @param {boolean} shouldLog - Whether to log debug information
 * @returns {object} Authentication result with success status and metrics
 */
export function performAuthFlow(loginPageUrl, loginPostUrl, basicAuth, globalState, shouldLog) {
  const startTime = Date.now();
  let authResult = {
    success: false,
    totalRequests: 0,
    errors: []
  };

  // Step 1: GET login page to extract cookies, CSRF token, and next-action
  if (shouldLog) {
    console.log(`🌐 Step 1: Getting login page for session setup`);
  }
  
  const loginPageRes = http.get(loginPageUrl, {
    headers: {
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'authorization': basicAuth,
    },
    tags: { endpoint: 'login_page' },
    timeout: '30s',
  });
  
  // Track RPS for GET request
  rps.add(1);
  authResult.totalRequests++;

  // Extract session data from login page
  const sessionData = extractSessionData(loginPageRes, shouldLog);
  
  // Check login page response
  check(loginPageRes, {
    'login page loads successfully': (r) => r.status === 200 || r.status === 401,
    'login page response time < 15000ms': (r) => r.timings.duration < 15000,
  });

  // For 401 responses, we may still be able to extract session data and proceed
  if (loginPageRes.status !== 200 && loginPageRes.status !== 401) {
    console.log(`⚠️  Login page failed - Status: ${loginPageRes.status}`);
    if (shouldLog) {
      console.log(`⚠️  Response body preview: ${loginPageRes.body ? loginPageRes.body.substring(0, 200) : 'empty'}...`);
    }
    return authResult;
  }

  if (shouldLog && loginPageRes.status === 401) {
    console.log(`ℹ️  Login page returned 401 (expected for protected endpoint), proceeding with login attempt`);
  }

  // Step 2: POST login with extracted session data
  if (shouldLog) {
    console.log(`🔐 Step 2: Performing login request with extracted session data`);
  }

  const loginResult = performLoginAttempts(
    loginPostUrl,
    sessionData,
    basicAuth,
    globalState,
    shouldLog
  );

  authResult.success = loginResult.success;
  authResult.totalRequests += loginResult.totalRequests;
  authResult.errors = loginResult.errors;

  const totalDuration = Date.now() - startTime;
  loginTime.add(totalDuration);
  failureRate.add(!authResult.success);

  return authResult;
}

/**
 * Extracts session data (cookies, next-action, router state) from login page
 */
function extractSessionData(loginPageRes, shouldLog) {
  let cookies = '';
  let nextActionId = '7fb96c047931578a3376831220b53ae65fd6500c5c'; // fallback
  let nextRouterState = '%5B%22%22%2C%7B%22children%22%3A%5B%22(login-template)%22%2C%7B%22children%22%3A%5B%22login%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D'; // fallback

  // Extract cookies from Set-Cookie headers
  const setCookieHeaders = loginPageRes.headers['Set-Cookie'];
  if (setCookieHeaders) {
    if (Array.isArray(setCookieHeaders)) {
      cookies = setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
    } else {
      cookies = setCookieHeaders.split(';')[0];
    }
  }
  
  // Parse HTML using regex patterns for better compatibility
  // Even if we get 401, there might still be useful HTML content to parse
  if (loginPageRes.body && loginPageRes.status === 200) {
    // Extract next-action from form inputs using regex
    const nextActionMatch = loginPageRes.body.match(/name="\$ACTION_ID_[^"]*"\s+value="([^"]+)"/i);
    if (nextActionMatch && nextActionMatch[1]) {
      nextActionId = nextActionMatch[1];
      if (shouldLog) {
        console.log(`🔍 Regex Extracted next-action: ${nextActionId.substring(0, 16)}...`);
      }
    }
    
    // Extract next-router-state-tree from form inputs
    const routerStateMatch = loginPageRes.body.match(/name="\$ACTION_REF_[^"]*"\s+value="([^"]+)"/i);
    if (routerStateMatch && routerStateMatch[1]) {
      nextRouterState = routerStateMatch[1];
      if (shouldLog) {
        console.log(`🔍 Regex Extracted router state: ${nextRouterState.substring(0, 50)}...`);
      }
    }
    
    // Fallback: try alternative patterns for action inputs
    if (nextActionId === '7fb96c047931578a3376831220b53ae65fd6500c5c') {
      // Look for any hidden input with ACTION_ID pattern
      const hiddenActionMatch = loginPageRes.body.match(/type="hidden"[^>]*name="[^"]*ACTION_ID[^"]*"[^>]*value="([^"]+)"/i);
      if (hiddenActionMatch && hiddenActionMatch[1] && hiddenActionMatch[1].length > 20) {
        nextActionId = hiddenActionMatch[1];
        if (shouldLog) {
          console.log(`🔍 Regex Fallback extracted action: ${nextActionId.substring(0, 16)}...`);
        }
      }
      
      // Alternative: look for value attribute before name attribute
      if (nextActionId === '7fb96c047931578a3376831220b53ae65fd6500c5c') {
        const altActionMatch = loginPageRes.body.match(/value="([^"]+)"[^>]*name="[^"]*ACTION_ID[^"]*"/i);
        if (altActionMatch && altActionMatch[1] && altActionMatch[1].length > 20) {
          nextActionId = altActionMatch[1];
          if (shouldLog) {
            console.log(`🔍 Regex Alternative extracted action: ${nextActionId.substring(0, 16)}...`);
          }
        }
      }
    }
  }
  
  if (shouldLog) {
    console.log(`📊 Login page response: Status ${loginPageRes.status}, Time: ${loginPageRes.timings.duration}ms`);
    console.log(`🍪 Cookies extracted: ${cookies ? 'Yes' : 'No'} (${cookies.length} chars)`);
    if (loginPageRes.status === 401) {
      console.log(`🔐 401 detected - will attempt direct login POST with fallback credentials`);
    }
  }

  return { cookies, nextActionId, nextRouterState };
}

/**
 * Performs login attempts with retry logic
 */
function performLoginAttempts(loginPostUrl, sessionData, basicAuth, globalState, shouldLog) {
  let loginSuccess = false;
  let attempt = 0;
  const maxAttempts = 4;
  let lastError = '';
  let totalRequests = 0;
  let errors = [];
  let { cookies, nextActionId, nextRouterState } = sessionData;

  while (!loginSuccess && attempt < maxAttempts) {
    attempt++;
    
    // Add exponential backoff with jitter for retries
    if (attempt > 1) {
      const backoffTime = Math.min(1000 * Math.pow(2, attempt - 2), 5000);
      const jitter = Math.random() * 500;
      sleep((backoffTime + jitter) / 1000);
      if (shouldLog) {
        console.log(`🔄 Retry attempt ${attempt}/${maxAttempts} after ${backoffTime + jitter}ms backoff`);
      }
    }

    // Randomize headers to avoid detection
    const randomUserAgent = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    ][attempt % 3];

    const formData = `1_email=truonghd1994%40gmail.com&1_password=Congtuma%40113&1_%24ACTION_ID_${nextActionId}=&0=%5B%22%24K1%22%2C%22%24%40login%22%2Cnull%5D&1=%5B%7B%22email%22%3A%22truonghd1994%40gmail.com%22%2C%22password%22%3A%22Congtuma%40113%22%7D%5D`;

    const res = http.post(loginPostUrl, formData, {
      headers: {
        'accept': 'text/x-component',
        'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
        'next-action': nextActionId,
        'next-router-state-tree': nextRouterState,
        'pragma': 'no-cache',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': randomUserAgent,
        'authorization': basicAuth,
        'cookie': cookies || 'session=temporary',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://dev.zenia.network',
        'referer': 'https://dev.zenia.network/login'
      },
      tags: { 
        endpoint: 'login_post',
        attempt: attempt,
        vu: __VU
      },
      timeout: '30s',
    });
    
    // Track RPS for POST request
    rps.add(1);
    totalRequests++;

    // Process login response
    const result = processLoginResponse(res, attempt, nextActionId, loginPostUrl, basicAuth, globalState, shouldLog);
    loginSuccess = result.success;
    lastError = result.error;
    
    if (result.error) {
      errors.push({
        timestamp: new Date().toISOString(),
        vu: __VU,
        attempt: attempt,
        error: result.error,
        status: res.status,
        responsePreview: res.body ? res.body.substring(0, 100) : 'empty'
      });
    }

    // Update next-action if we got a fresh one
    if (result.newNextActionId) {
      nextActionId = result.newNextActionId;
      totalRequests += result.additionalRequests || 0;
    }

    // System recovery monitoring
    updateSystemRecovery(loginSuccess, globalState, shouldLog);

    // Add small delay between attempts to avoid overwhelming the server
    if (!loginSuccess && attempt < maxAttempts) {
      sleep(0.5 + Math.random() * 0.5); // 0.5-1s random delay
    }
  }

  if (!loginSuccess && shouldLog) {
    console.log(`❌ Login completely failed after ${maxAttempts} attempts. Last error: ${lastError}`);
  }

  return { success: loginSuccess, totalRequests, errors, lastError };
}

/**
 * Processes login response and handles different error types
 */
function processLoginResponse(res, attempt, nextActionId, loginPostUrl, basicAuth, globalState, shouldLog) {
  let success = false;
  let error = '';
  let newNextActionId = null;
  let additionalRequests = 0;

  if (res.status === 200) {
    // More flexible success detection for Next.js server actions
    if (res.body) {
      const body = res.body.toLowerCase();
      const successPatterns = [
        '"success":true',
        'dashboard',
        'redirect',
        'login successful',
        'authenticated',
        'welcome',
        // Next.js server action success patterns
        '1:hl:', // Next.js RSC success format
        '"type":"success"',
        'location.href',
        'window.location'
      ];
      
      const hasSuccessPattern = successPatterns.some(pattern => body.includes(pattern.toLowerCase()));
      
      if (hasSuccessPattern) {
        success = true;
        if (shouldLog) {
          console.log(`✅ Login successful on attempt ${attempt} - Time: ${res.timings.duration}ms`);
          console.log(`🔍 Success pattern found in response`);
        }
        
        // Reset system monitoring if we had failures
        if (globalState.consecutiveFailureCount > 0) {
          const recoveryDuration = Date.now() - globalState.lastFailureTime;
          recoveryTime.add(recoveryDuration);
          if (shouldLog) {
            console.log(`🚀 System recovery detected after ${recoveryDuration}ms, ${globalState.consecutiveFailureCount} consecutive failures cleared`);
          }
          globalState.consecutiveFailureCount = 0;
          globalState.systemRecoveryStarted = false;
        }
      } else {
        error = `Invalid response content - no success pattern found`;
        errorInvalidContentCounter.add(1);
        if (shouldLog) {
          console.log(`❌ Login failed (attempt ${attempt}) - Status 200 but no success pattern found`);
          console.log(`📄 Response preview: ${res.body.substring(0, 200)}...`);
        }
      }
    } else {
      error = `Empty response body`;
      errorInvalidContentCounter.add(1);
      if (shouldLog) {
        console.log(`❌ Login failed (attempt ${attempt}) - Status 200 but empty response body`);
      }
    }
  } else if (res.status === 404) {
    error = `Server action not found (${res.status}) - Next-action ID may be invalid`;
    error404Counter.add(1);
    if (shouldLog) {
      console.log(`🔍 404 Error: Server action not found. Next-action: ${nextActionId.substring(0, 16)}...`);
    }
    
    // Try to get fresh action ID
    const freshResult = getFreshActionId(loginPostUrl.replace('/login', '/login'), basicAuth, shouldLog);
    if (freshResult.actionId) {
      newNextActionId = freshResult.actionId;
      additionalRequests = 1;
    }
  } else if (res.status === 401) {
    error = `Authentication failed (${res.status})`;
    error401Counter.add(1);
  } else if (res.status === 403) {
    error = `Forbidden access (${res.status}) - Rate limited or blocked`;
    error403Counter.add(1);
  } else if (res.status >= 500 && res.status < 600) {
    error = `Server error (${res.status})`;
    error5xxCounter.add(1);
  } else if (res.status === 0) {
    error = `Network/timeout error`;
    errorNetworkCounter.add(1);
  } else {
    error = `HTTP ${res.status}`;
    errorOtherCounter.add(1);
  }

  return { success, error, newNextActionId, additionalRequests };
}

/**
 * Gets fresh action ID from login page
 */
function getFreshActionId(loginPageUrl, basicAuth, shouldLog) {
  const freshPageRes = http.get(loginPageUrl, {
    headers: { 'authorization': basicAuth },
    timeout: '15s',
  });
  
  // Track RPS for fresh page request
  rps.add(1);
  
  if (freshPageRes.status === 200 && freshPageRes.body) {
    // Use regex to extract fresh action ID
    const freshActionMatch = freshPageRes.body.match(/name="\$ACTION_ID_[^"]*"\s+value="([^"]+)"/i);
    if (freshActionMatch && freshActionMatch[1]) {
      if (shouldLog) {
        console.log(`🔄 Regex Retrieved fresh action ID: ${freshActionMatch[1].substring(0, 16)}...`);
      }
      return { actionId: freshActionMatch[1] };
    } else {
      // Try alternative pattern for fresh action ID
      const altFreshMatch = freshPageRes.body.match(/value="([^"]+)"[^>]*name="[^"]*ACTION_ID[^"]*"/i);
      if (altFreshMatch && altFreshMatch[1] && altFreshMatch[1].length > 20) {
        if (shouldLog) {
          console.log(`🔄 Regex Alt Retrieved fresh action ID: ${altFreshMatch[1].substring(0, 16)}...`);
        }
        return { actionId: altFreshMatch[1] };
      }
    }
  }
  
  return { actionId: null };
}

/**
 * Updates system recovery monitoring
 */
function updateSystemRecovery(loginSuccess, globalState, shouldLog) {
  if (!loginSuccess) {
    globalState.totalFailures++;
    globalState.consecutiveFailureCount++;
    globalState.lastFailureTime = Date.now();
    
    if (globalState.consecutiveFailureCount >= 3 && !globalState.systemRecoveryStarted) {
      globalState.systemRecoveryStarted = true;
      globalState.systemDownTime = Date.now();
      if (shouldLog) {
        console.log(`🚨 System degradation detected: ${globalState.consecutiveFailureCount} consecutive failures`);
      }
    }
  }
}