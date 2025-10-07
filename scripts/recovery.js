/**
 * Enhanced teardown function with comprehensive system recovery reporting
 * @param {object} globalState - Global state object with monitoring variables
 * @param {array} errorLog - Array of all errors logged during the test
 */
export function generateRecoveryReport(globalState, errorLog) {
  const testEndTime = Date.now();
  const testDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  console.log('\n🏁 ===== SYSTEM RECOVERY & PERFORMANCE ANALYSIS =====');
  console.log(`📊 Test Duration: ${testDuration / 1000} seconds (5 minutes)`);
  console.log(`📈 Total Requests: ${globalState.totalRequests}`);
  console.log(`❌ Total Failures: ${globalState.totalFailures}`);
  
  const overallFailureRate = globalState.totalRequests > 0 ? (globalState.totalFailures / globalState.totalRequests * 100) : 0;
  console.log(`📉 Overall Failure Rate: ${overallFailureRate.toFixed(2)}%`);
  
  // Calculate and report RPS
  const averageRPS = globalState.totalRequests > 0 ? (globalState.totalRequests / (testDuration / 1000)) : 0;
  console.log(`⚡ Average RPS: ${averageRPS.toFixed(2)} requests/second`);
  
  // System availability calculation
  const systemUptime = testDuration - globalState.systemDownTime;
  const availabilityPercentage = (systemUptime / testDuration * 100);
  console.log(`⏰ System Availability: ${availabilityPercentage.toFixed(2)}%`);
  
  // MTTR (Mean Time To Recovery) and MTBF (Mean Time Between Failures) simulation
  if (globalState.totalFailures > 0) {
    const estimatedMTTR = globalState.systemDownTime > 0 ? globalState.systemDownTime / 1000 : 0;
    const estimatedMTBF = globalState.totalRequests > 0 ? (testDuration / globalState.totalFailures) / 1000 : 0;
    
    console.log(`🔧 Estimated MTTR (Mean Time To Recovery): ${estimatedMTTR.toFixed(2)} seconds`);
    console.log(`⚡ Estimated MTBF (Mean Time Between Failures): ${estimatedMTBF.toFixed(2)} seconds`);
    
    // Service level indicators
    if (availabilityPercentage >= 99.9) {
      console.log(`🌟 SLA Status: EXCELLENT (99.9%+ uptime)`);
    } else if (availabilityPercentage >= 99.0) {
      console.log(`✅ SLA Status: GOOD (99.0%+ uptime)`);
    } else if (availabilityPercentage >= 95.0) {
      console.log(`⚠️  SLA Status: ACCEPTABLE (95.0%+ uptime)`);
    } else {
      console.log(`🚨 SLA Status: CRITICAL (<95% uptime)`);
    }
  }
  
  // Performance recommendations
  generatePerformanceRecommendations(overallFailureRate, globalState);
  
  // Detailed Error Log Report
  generateErrorLogReport(errorLog);
  
  // Final recovery status
  generateFinalRecoveryStatus(globalState);
  
  console.log('📋 ===== END RECOVERY ANALYSIS =====\n');
}

/**
 * Generates performance recommendations based on failure rate and system state
 */
function generatePerformanceRecommendations(overallFailureRate, globalState) {
  console.log('\n💡 PERFORMANCE RECOMMENDATIONS:');
  
  if (overallFailureRate > 20) {
    console.log('🔥 HIGH PRIORITY: Failure rate exceeds 20% - immediate infrastructure review needed');
  } else if (overallFailureRate > 10) {
    console.log('⚠️  MEDIUM PRIORITY: Failure rate above 10% - monitor closely and optimize');
  } else {
    console.log('✅ LOW PRIORITY: Failure rate within acceptable limits');
  }
  
  if (globalState.systemDownTime > 60000) { // More than 1 minute
    console.log('🛠️  INFRASTRUCTURE: Extended downtime detected - review system resilience');
  }
  
  if (globalState.consecutiveFailureCount > 10) {
    console.log('🔄 RETRY LOGIC: High consecutive failures - consider circuit breaker pattern');
  }
  
  // Additional recommendations based on specific patterns
  if (overallFailureRate > 30) {
    console.log('🚨 CRITICAL: Consider implementing rate limiting and circuit breakers');
  }
  
  if (globalState.systemDownTime > 180000) { // More than 3 minutes
    console.log('⚡ SCALING: Consider auto-scaling or load balancing improvements');
  }
}

/**
 * Generates detailed error log report with analysis
 */
function generateErrorLogReport(errorLog) {
  console.log('\n📋 ===== DETAILED ERROR LOG REPORT =====');
  
  if (errorLog.length > 0) {
    console.log(`📊 Total Errors Logged: ${errorLog.length}`);
    
    // Group errors by type and status
    const { errorsByType, errorsByStatus } = analyzeErrors(errorLog);
    
    // Error distribution by type
    console.log('\n🔍 Error Distribution by Type:');
    Object.entries(errorsByType).forEach(([type, count]) => {
      const percentage = ((count / errorLog.length) * 100).toFixed(1);
      console.log(`   ${type}: ${count} errors (${percentage}%)`);
    });
    
    // Error distribution by HTTP status
    console.log('\n🔍 Error Distribution by HTTP Status:');
    Object.entries(errorsByStatus).forEach(([status, count]) => {
      const percentage = ((count / errorLog.length) * 100).toFixed(1);
      console.log(`   HTTP ${status}: ${count} errors (${percentage}%)`);
    });
    
    // Timeline analysis
    generateTimelineAnalysis(errorLog);
    
    // VU analysis
    generateVUAnalysis(errorLog);
    
  } else {
    console.log('🎉 No errors logged during the test!');
  }
}

/**
 * Analyzes errors by type and status
 */
function analyzeErrors(errorLog) {
  const errorsByType = {};
  const errorsByStatus = {};
  
  errorLog.forEach(error => {
    const errorType = error.error.split(' ')[0]; // Get first word as error type
    errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    errorsByStatus[error.status] = (errorsByStatus[error.status] || 0) + 1;
  });
  
  return { errorsByType, errorsByStatus };
}

/**
 * Generates timeline analysis of errors
 */
function generateTimelineAnalysis(errorLog) {
  // Show first 5 and last 5 errors for pattern analysis
  console.log('\n🕐 First 5 Errors (Test Start):');
  errorLog.slice(0, 5).forEach((error, index) => {
    console.log(`   ${index + 1}. ${error.timestamp} [VU${error.vu}:A${error.attempt}] ${error.error}`);
  });
  
  if (errorLog.length > 5) {
    console.log('\n🕐 Last 5 Errors (Test End):');
    errorLog.slice(-5).forEach((error, index) => {
      const actualIndex = errorLog.length - 5 + index + 1;
      console.log(`   ${actualIndex}. ${error.timestamp} [VU${error.vu}:A${error.attempt}] ${error.error}`);
    });
  }
}

/**
 * Generates VU analysis showing most problematic virtual users
 */
function generateVUAnalysis(errorLog) {
  // Most problematic VUs
  const vuErrors = {};
  errorLog.forEach(error => {
    vuErrors[error.vu] = (vuErrors[error.vu] || 0) + 1;
  });
  
  const topVUs = Object.entries(vuErrors)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  if (topVUs.length > 0) {
    console.log('\n👥 Top 5 VUs with Most Errors:');
    topVUs.forEach(([vu, count]) => {
      console.log(`   VU${vu}: ${count} errors`);
    });
  }
}

/**
 * Generates final recovery status report
 */
function generateFinalRecoveryStatus(globalState) {
  console.log('\n🎯 FINAL RECOVERY STATUS:');
  
  if (globalState.consecutiveFailureCount === 0) {
    console.log('🚀 System fully recovered and operating normally');
  } else {
    console.log(`⚠️  System still experiencing issues: ${globalState.consecutiveFailureCount} consecutive failures`);
  }
  
  // Additional recovery insights
  if (globalState.systemRecoveryStarted && globalState.consecutiveFailureCount < 3) {
    console.log('🔄 System showing signs of recovery - monitoring recommended');
  }
  
  if (globalState.totalFailures === 0) {
    console.log('🎯 PERFECT: Zero failures detected during entire test run');
  }
}