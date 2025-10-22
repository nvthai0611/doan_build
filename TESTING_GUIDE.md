# 🧪 Hướng Dẫn Test Authentication

## 🚀 Bắt Đầu

### 1. Restart Servers

```bash
# Terminal 1 - Backend
cd server
npm run start:dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### 2. Clear Browser Data

Mở DevTools (F12) → Console và chạy:

```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

## ✅ Test Cases

### Test 1: Login
1. Truy cập `http://localhost:5173/auth/login`
2. Login với: `owner@qne.edu.vn` / `123456`
3. **Kiểm tra Console** thấy:
   ```
   ✅ Login successful, tokens stored
   ```
4. **Kiểm tra Application → Cookies** có:
   - `accessToken`
   - `refreshToken`
   - `user`

### Test 2: Page Reload (Token Verification)
1. Reload trang (F5)
2. **Kiểm tra Console** thấy:
   ```
   ✅ Token verified successfully
   ```
3. User vẫn đăng nhập (không bị redirect về login)

### Test 3: Auto Refresh Token

**Cách nhanh để test**:

1. Mở Console và chạy:
```javascript
// Xóa access token để trigger refresh
document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
```

2. Navigate sang trang khác hoặc reload

3. **Kiểm tra Console** thấy:
```
🔄 Attempting to refresh token...
✅ Refresh token response: {...}
✅ Updating refresh token (rotation)
✅ Token refreshed successfully
```

4. **Kiểm tra Network tab**:
   - Tìm request `POST /api/v1/auth/refresh`
   - Response có `accessToken` VÀ `refreshToken` mới

### Test 4: Refresh Token Rotation

1. Mở **Application → Cookies**
2. Copy giá trị `refreshToken` (token cũ)
3. Trigger refresh (theo Test 3)
4. So sánh `refreshToken` mới - **PHẢI KHÁC** token cũ
5. **Kiểm tra Database** (optional):
   ```sql
   SELECT * FROM UserSession WHERE isActive = true ORDER BY createdAt DESC;
   ```
   - Chỉ có 1 session active mới nhất
   - Session cũ có `isActive = false`

### Test 5: Logout
1. Click nút Logout
2. **Kiểm tra**:
   - Redirect về `/auth/login`
   - Console thấy: `Đăng xuất thành công`
   - Cookies đã bị xóa hết
3. Thử truy cập trang cần auth → Bị redirect về login

## 🐛 Troubleshooting

| Vấn đề | Giải pháp |
|--------|-----------|
| "No refresh token available" | Clear cookies, login lại |
| Token không auto refresh | Check Console logs, verify interceptor hoạt động |
| "Phát hiện sử dụng lại refresh token" | Logout và login lại (tính năng bảo mật) |
| TypeScript errors | Restart TS Server: Ctrl+Shift+P → "TypeScript: Restart TS Server" |

## 🔍 Debug Tips

### Xem tất cả cookies
```javascript
console.table(document.cookie.split(';').map(c => {
  const [key, value] = c.trim().split('=');
  return { key, value: value?.substring(0, 20) + '...' };
}));
```

### Xem access token payload
```javascript
const token = document.cookie.split(';').find(c => c.includes('accessToken'))?.split('=')[1];
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token payload:', payload);
  console.log('Expires at:', new Date(payload.exp * 1000));
}
```

### Monitor refresh calls
```javascript
// Run this before triggering refresh
let refreshCount = 0;
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/auth/refresh')) {
    refreshCount++;
    console.log(`🔄 Refresh call #${refreshCount}`, new Date().toLocaleTimeString());
  }
  return originalFetch.apply(this, args);
};
```

## ✅ Expected Results

Sau khi test xong, bạn sẽ thấy:

- [x] Login thành công lưu tokens
- [x] Page reload giữ được login state
- [x] Access token hết hạn → Auto refresh
- [x] Refresh token được rotate (thay đổi)
- [x] Logout xóa sạch data
- [x] Console logs rõ ràng tại mỗi bước

## 🎉 Xong!

Nếu tất cả test cases pass → Authentication system hoạt động hoàn hảo! 🚀

