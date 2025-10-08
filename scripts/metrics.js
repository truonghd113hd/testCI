import { Rate, Trend, Counter } from 'k6/metrics';

// Custom Metrics for System Recovery Tracking
export const failureRate = new Rate('login_failure_rate');
export const recoveryTime = new Trend('system_recovery_time');
export const consecutiveFailures = new Counter('consecutive_failures');
export const loginTime = new Trend('login_duration');
export const rps = new Rate('requests_per_second');

// Individual Counters for different error types
export const error404Counter = new Counter('error_404_server_action_not_found');
export const error401Counter = new Counter('error_401_auth_failed');
export const error403Counter = new Counter('error_403_forbidden');
export const error5xxCounter = new Counter('error_5xx_server_error');
export const errorNetworkCounter = new Counter('error_network_timeout');
export const errorOtherCounter = new Counter('error_other_http');
export const errorInvalidContentCounter = new Counter('error_invalid_content');