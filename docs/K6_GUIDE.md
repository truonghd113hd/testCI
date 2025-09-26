# K6 Load Testing Guide

## Tổng quan k6

k6 là một công cụ load testing hiện đại, được thiết kế cho developer với những ưu điểm:

### ✅ Ưu điểm của k6

1. **Scripting JavaScript**: Dễ học, quen thuộc với dev
2. **CLI đơn giản**: Chỉ cần 1 lệnh để chạy test
3. **Cloud Native**: Tích hợp tốt với CI/CD, container
4. **Performance cao**: Viết bằng Go, xử lý được hàng nghìn concurrent users
5. **Metrics phong phú**: Built-in metrics + custom metrics
6. **Protocol support**: HTTP/1.1, HTTP/2, WebSocket, gRPC
7. **Free & Open Source**: Miễn phí với tính năng core mạnh mẽ

### ❌ Nhược điểm của k6

1. **Không có GUI**: Chỉ có CLI và code (không như JMeter)
2. **Browser automation hạn chế**: Không phải browser testing tool
3. **Learning curve**: Cần biết JavaScript cơ bản
4. **Memory usage**: Với test lớn cần nhiều RAM

## So sánh với công cụ khác

| Tính năng | k6 | JMeter | Locust | Artillery |
|-----------|----|---------|---------|---------| 
| Language | JavaScript | Java/XML | Python | JavaScript |
| GUI | ❌ | ✅ | ✅ Web UI | ❌ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| CI/CD | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Cloud | ✅ k6 Cloud | ❌ | ✅ | ❌ |
| Learning Curve | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## Cấu trúc Test Script

### Basic Structure
\`\`\`javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,        // Virtual Users
  duration: '30s', // Test Duration
};

export default function () {
  // Test logic here
  const res = http.get('https://api.example.com');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
\`\`\`

### Advanced Configuration
\`\`\`javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};
\`\`\`

## Test Scenarios

### 1. API Load Testing
\`\`\`bash
npm run k6:advanced
\`\`\`

### 2. CI/CD Testing  
\`\`\`bash
make k6-ci
\`\`\`

### 3. Cloud Testing
\`\`\`bash
# Cần k6 cloud account
k6 login cloud --token <your-token>
npm run k6:cloud
\`\`\`

## Best Practices

### 1. Test Data Management
- Sử dụng test database riêng
- Mock data thay vì production data
- Clean up sau mỗi test run

### 2. Environment Isolation
- Local: `localhost` endpoints  
- CI: Service containers
- Cloud: Staging environment URLs

### 3. Thresholds Setup
\`\`\`javascript
thresholds: {
  http_req_failed: ['rate<0.05'],     // < 5% errors
  http_req_duration: ['p(95)<1000'],  // 95% < 1s
  http_reqs: ['rate>10'],             // > 10 RPS
}
\`\`\`

### 4. Monitoring & Metrics
- InfluxDB + Grafana cho visualization
- Custom metrics cho business logic
- Alerts cho threshold violations

## Chạy Tests

### Local Development
\`\`\`bash
# Setup môi trường
make k6-setup

# Chạy basic test
npm run k6

# Chạy advanced test với stages
npm run k6:advanced

# Clean up
make k6-clean
\`\`\`

### CI/CD Integration  
Test được tự động chạy trong GitHub Actions khi push code.

### Cloud Testing
1. Tạo account tại [k6.io](https://k6.io)
2. Get API token
3. Login: \`k6 login cloud --token <token>\`
4. Run: \`npm run k6:cloud\`

## Kết luận

k6 là lựa chọn tuyệt vời cho:
- ✅ API load testing
- ✅ CI/CD integration  
- ✅ Developer-friendly scripting
- ✅ Cloud-native applications
- ✅ Performance monitoring

Không phù hợp cho:
- ❌ Browser automation testing
- ❌ GUI-based test creation
- ❌ Non-developer users