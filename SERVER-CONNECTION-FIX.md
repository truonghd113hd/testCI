# Fix Server Connection Error

## 🚨 Error: `Failed to connect to localhost port 3000`

Lỗi này xảy ra khi k6 không thể kết nối đến server NestJS. Đây là cách fix:

## 🛠️ Quick Fix Steps

### 1. **Kiểm tra server có đang chạy không:**
```bash
curl http://localhost:3000/
# Hoặc
lsof -i :3000
```

### 2. **Build và start server:**
```bash
# Build project trước
npm run build

# Start production server
npm run start:prod
```

### 3. **Đợi server khởi động (quan trọng!):**
```bash
# Chờ 30-60 giây để server hoàn toàn ready
# Kiểm tra server logs để đảm bảo không có lỗi
```

### 4. **Verify server health:**
```bash
# Chạy health check
k6 run scripts/server-check.js

# Hoặc dùng curl
curl -v http://localhost:3000/
```

### 5. **Chạy k6 test:**
```bash
npm run k6:advanced
```

## 🚀 Automated Solution

### Sử dụng script tự động:
```bash
# Script này sẽ tự động start server và chạy test
npm run k6:with-server
```

## 🔍 Troubleshooting

### Server không start được:
```bash
# Check dependencies
npm ci

# Check database connection
docker compose -f docker/docker-compose.local.yml up -d

# Check logs
npm run start:prod
# Xem console output để tìm lỗi
```

### Port 3000 đã được sử dụng:
```bash
# Tìm process sử dụng port 3000
lsof -i :3000

# Kill process cũ
kill -9 <PID>

# Hoặc dùng port khác
BASE_URL=http://localhost:3001 npm run k6:advanced
```

### Database connection error:
```bash
# Start database services
docker compose -f docker/docker-compose.local.yml up -d postgres redis

# Check database is running
docker ps
```

## ✅ Success Indicators

Khi server ready, bạn sẽ thấy:
```
✅ Server responded with status: 200
📊 Response time: <100ms
🎉 Server is healthy and ready for testing!
```

## 📝 Best Practice Workflow

```bash
# 1. Start services
docker compose -f docker/docker-compose.local.yml up -d

# 2. Build project
npm run build

# 3. Start server
npm run start:prod &

# 4. Wait and verify
sleep 30
k6 run scripts/server-check.js

# 5. Run tests
npm run k6:advanced
```

## 🎯 One-liner Solution

```bash
# All-in-one command (recommended)
npm run k6:with-server
```