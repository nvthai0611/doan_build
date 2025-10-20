# Email Queue System - Hướng dẫn cấu hình

## Tổng quan
Hệ thống email queue sử dụng Bull (Redis-based) để xử lý email bất đồng bộ, giúp tránh việc gửi email làm chậm response của API.

**🔄 Flexible**: Có thể chọn giữa Queue (khuyến nghị) hoặc Direct Email (đơn giản)

## Cấu hình cần thiết

### 1. Redis Configuration (Chỉ cần khi dùng Queue)
Thêm các biến môi trường sau vào file `.env`:

```env
# Email Mode - Chọn cách gửi email
USE_EMAIL_QUEUE=true  # true = dùng queue, false = gửi trực tiếp

# Redis Configuration (chỉ cần khi USE_EMAIL_QUEUE=true)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE="false"
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROMNAME="Trung Tâm Giáo Dục"
SMTP_FROMEMAIL=your-email@gmail.com
```

### 2. Cài đặt Redis (Chỉ cần khi dùng Queue)
```bash
# Windows (sử dụng Chocolatey)
choco install redis

# macOS (sử dụng Homebrew)
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server

# Khởi động Redis
redis-server
```

### 3. Cài đặt dependencies
```bash
npm install @nestjs/bull bull
```

## Cách sử dụng

### 🚀 Mode 1: Queue (Khuyến nghị cho Production)
```env
USE_EMAIL_QUEUE=true
```

**Ưu điểm:**
- ⚡ API response nhanh
- 🔄 Retry tự động
- 📈 Scalable
- 🔍 Monitoring

**Nhược điểm:**
- Cần Redis
- Phức tạp hơn

### 📧 Mode 2: Direct Email (Đơn giản cho Development)
```env
USE_EMAIL_QUEUE=false
```

**Ưu điểm:**
- 🎯 Đơn giản, không cần Redis
- 🔧 Dễ debug
- ⚡ Setup nhanh

**Nhược điểm:**
- 🐌 API response chậm hơn
- ❌ Không có retry
- 📉 Khó scale

## 🔄 Chuyển đổi giữa Queue và Direct Email

### Từ Queue sang Direct Email
```env
# Trong .env
USE_EMAIL_QUEUE=false
```

**Không cần:**
- Redis server
- Bull dependencies
- Queue monitoring

**Vẫn cần:**
- SMTP configuration
- Email templates

### Từ Direct Email sang Queue
```env
# Trong .env
USE_EMAIL_QUEUE=true
```

**Cần thêm:**
- Redis server
- Bull dependencies
- Queue monitoring

## 📊 So sánh Performance

| Aspect | Queue Mode | Direct Mode |
|--------|------------|-------------|
| API Response | ~100ms | ~2-5s |
| Email Delivery | Async | Sync |
| Error Handling | Retry + Queue | Immediate fail |
| Monitoring | Full queue stats | Basic logs |
| Setup Complexity | Medium | Simple |
| Production Ready | ✅ | ⚠️ |

## 🎯 Khi nào dùng gì?

### Dùng Queue khi:
- ✅ Production environment
- ✅ Cần performance tốt
- ✅ Có nhiều email cần gửi
- ✅ Cần reliability cao
- ✅ Có team DevOps

### Dùng Direct Email khi:
- ✅ Development/Testing
- ✅ Prototype nhanh
- ✅ Không có Redis
- ✅ Ít email cần gửi
- ✅ Team nhỏ

### 📊 Queue Statistics
```typescript
// Lấy thông tin queue
const queueInfo = await emailQueueService.getQueueInfo();
console.log(queueInfo);
// Output: { waiting: 5, active: 2, completed: 100, failed: 3, total: 110 }
```

## Monitoring và Debug

### 1. Xem logs
```bash
# Xem logs của server
npm run start:dev

# Logs sẽ hiển thị:
# 📧 Email job đã được thêm vào queue: 12345
# 📧 Bắt đầu xử lý email job 12345 cho lớp abc và giáo viên def
# ✅ Email đã được gửi thành công cho job 12345
```

### 2. Queue Management
```typescript
// Xóa tất cả jobs
await emailQueueService.clearQueue();

// Xóa job cụ thể
await emailQueueService.removeJob('job-id');
```

## Troubleshooting

### 1. Redis không kết nối được
```bash
# Kiểm tra Redis có chạy không
redis-cli ping
# Nếu trả về PONG thì Redis đang chạy

# Kiểm tra port
netstat -an | grep 6379
```

### 2. Email không gửi được
- Kiểm tra SMTP configuration
- Đảm bảo App Password đúng (cho Gmail)
- Kiểm tra firewall có chặn port SMTP không

### 3. Queue không hoạt động
- Kiểm tra Redis connection
- Xem logs để tìm lỗi
- Đảm bảo EmailProcessor được register đúng

## Cấu trúc Files

```
server/src/modules/shared/services/
├── email-queue.service.ts      # Quản lý queue
├── email-processor.service.ts   # Xử lý email jobs
└── email-notification.service.ts # Gửi email trực tiếp
```

## API Endpoints

Hiện tại chưa có API endpoints để quản lý queue, nhưng có thể thêm:

```typescript
// GET /admin-center/email-queue/stats
// Xóa queue: POST /admin-center/email-queue/clear
// Xóa job: DELETE /admin-center/email-queue/jobs/:id
```

## Best Practices

1. **Luôn sử dụng queue** cho email trong production
2. **Monitor queue** thường xuyên để phát hiện vấn đề
3. **Set retry limits** hợp lý (3-5 lần)
4. **Log đầy đủ** để debug
5. **Test email** trước khi deploy
