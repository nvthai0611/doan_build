# Hướng Dẫn Thanh Toán Sepay

## Tổng Quan

Hệ thống thanh toán Sepay cho phép phụ huynh thanh toán học phí thông qua chuyển khoản ngân hàng bằng mã QR tự động.

## Cấu Hình

### 1. Thêm biến môi trường vào file `.env`

```env
# Sepay Configuration
SEPAY_API_KEY=your_sepay_api_key_here
SEPAY_ACCOUNT_NUMBER=0123456789
SEPAY_BANK_CODE=MB
SEPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Cấu hình Webhook trên Sepay Dashboard

1. Đăng nhập vào [Sepay Dashboard](https://my.sepay.vn)
2. Vào mục **Cài đặt** → **Webhook**
3. Thêm URL webhook: `https://your-domain.com/payment/sepay/webhook`
4. Lưu lại

## API Endpoints

### 1. Tạo Mã QR Thanh Toán

**Endpoint:** `POST /payment/sepay/create-qr`

**Request Body:**

```json
{
  "feeRecordId": "uuid-of-fee-record",
  "amount": 1000000,
  "parentId": "uuid-of-parent" // Optional
}
```

**Response:**

```json
{
  "data": {
    "orderCode": "HP1729678901234",
    "qrCodeUrl": "https://img.vietqr.io/image/MB-0123456789-compact2.png?amount=1000000&addInfo=...",
    "amount": 1000000,
    "content": "HP1729678901234 Nguyen Van A",
    "accountNumber": "0123456789",
    "bankCode": "MB",
    "bankName": "MB Bank",
    "feeRecord": {
      "id": "uuid",
      "totalAmount": 2000000,
      "paidAmount": 0,
      "remainingAmount": 2000000
    }
  },
  "message": "Tạo mã QR thanh toán thành công"
}
```

### 2. Webhook Nhận Thông Báo

**Endpoint:** `POST /payment/sepay/webhook`

Sepay sẽ tự động gọi endpoint này khi có giao dịch mới.

**Request Body (từ Sepay):**

```json
{
  "id": "123456",
  "gateway": "MB",
  "transaction_date": "2025-10-23 10:30:00",
  "account_number": "0123456789",
  "amount_in": 1000000,
  "amount_out": 0,
  "transaction_content": "HP1729678901234 Nguyen Van A",
  "reference_number": "FT25297123456",
  "bank_brand_name": "MB Bank"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment processed successfully"
}
```

### 3. Kiểm Tra Trạng Thái Giao Dịch

**Endpoint:** `GET /payment/sepay/verify/:orderCode`

**Example:** `GET /payment/sepay/verify/HP1729678901234`

**Response:**

```json
{
  "data": {
    "orderCode": "HP1729678901234",
    "amount": 1000000,
    "status": "completed",
    "paidAt": "2025-10-23T10:30:00Z",
    "feeRecord": {
      "id": "uuid",
      "totalAmount": 2000000,
      "paidAmount": 1000000,
      "status": "partially_paid"
    }
  },
  "message": "Lấy thông tin giao dịch thành công"
}
```

### 4. Lấy Lịch Sử Thanh Toán

**Endpoint:** `GET /payment/history/:studentId`

**Example:** `GET /payment/history/uuid-of-student`

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 1000000,
      "status": "completed",
      "paidAt": "2025-10-23T10:30:00Z",
      "method": "bank_transfer",
      "transactionCode": "FT25297123456",
      "feeRecord": {
        "id": "uuid",
        "totalAmount": 2000000,
        "paidAmount": 1000000,
        "class": {
          "name": "Toán 10A1"
        }
      },
      "parent": {
        "user": {
          "fullName": "Nguyen Van B"
        }
      }
    }
  ],
  "message": "Lấy lịch sử thanh toán thành công"
}
```

### 5. Lấy Danh Sách Giao Dịch Từ Sepay

**Endpoint:** `GET /payment/sepay/transactions?limit=50`

**Response:**

```json
[
  {
    "id": "123456",
    "gateway": "MB",
    "transaction_date": "2025-10-23 10:30:00",
    "account_number": "0123456789",
    "amount_in": 1000000,
    "amount_out": 0,
    "transaction_content": "HP1729678901234 Nguyen Van A",
    "reference_number": "FT25297123456",
    "bank_brand_name": "MB Bank"
  }
]
```

## Workflow Thanh Toán

### 1. Phụ Huynh Thanh Toán

```
1. Phụ huynh chọn hóa đơn cần thanh toán
   ↓
2. Frontend gọi API: POST /payment/sepay/create-qr
   ↓
3. Backend tạo:
   - Mã đơn hàng (orderCode)
   - Mã QR thanh toán
   - Payment record với status = "pending"
   ↓
4. Frontend hiển thị mã QR cho phụ huynh
   ↓
5. Phụ huynh quét QR và chuyển khoản
   ↓
6. Sepay nhận giao dịch → gọi webhook
   ↓
7. Backend xử lý webhook:
   - Cập nhật Payment: status = "completed"
   - Cập nhật FeeRecord: paidAmount, status
   - Tạo Notification cho phụ huynh
   ↓
8. Frontend nhận thông báo thanh toán thành công
```

### 2. Trạng Thái FeeRecord

- **pending**: Chưa thanh toán (paidAmount = 0)
- **partially_paid**: Thanh toán một phần (0 < paidAmount < totalAmount)
- **paid**: Đã thanh toán đủ (paidAmount >= totalAmount)

### 3. Xử Lý Thanh Toán Nhiều Lần

Một hóa đơn có thể được thanh toán nhiều lần:

```typescript
// Ví dụ: Hóa đơn 2,000,000 VNĐ
FeeRecord {
  totalAmount: 2000000,
  paidAmount: 0,
  status: "pending"
}

// Lần 1: Thanh toán 1,000,000
Payment 1 { amount: 1000000, status: "completed" }
FeeRecord { paidAmount: 1000000, status: "partially_paid" }

// Lần 2: Thanh toán 1,000,000
Payment 2 { amount: 1000000, status: "completed" }
FeeRecord { paidAmount: 2000000, status: "paid" }
```

## Testing

### 1. Test Tạo QR (Local)

```bash
curl -X POST http://localhost:9999/payment/sepay/create-qr \
  -H "Content-Type: application/json" \
  -d '{
    "feeRecordId": "your-fee-record-uuid",
    "amount": 1000000,
    "parentId": "your-parent-uuid"
  }'
```

### 2. Test Webhook (Local với ngrok)

```bash
# 1. Cài đặt ngrok
npm install -g ngrok

# 2. Chạy ngrok
ngrok http 9999

# 3. Sử dụng URL ngrok để cấu hình webhook trên Sepay
# Example: https://abc123.ngrok.io/payment/sepay/webhook
```

### 3. Test Webhook Thủ Công

```bash
curl -X POST http://localhost:9999/payment/sepay/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "123456",
    "gateway": "MB",
    "transaction_date": "2025-10-23 10:30:00",
    "account_number": "0123456789",
    "amount_in": 1000000,
    "amount_out": 0,
    "transaction_content": "HP1729678901234 Nguyen Van A",
    "reference_number": "FT25297123456",
    "bank_brand_name": "MB Bank"
  }'
```

## Lưu Ý Quan Trọng

1. **Mã đơn hàng (orderCode)**:

   - Format: `HP + timestamp + random`
   - Example: `HP1729678901234`
   - Phải xuất hiện trong nội dung chuyển khoản

2. **Nội dung chuyển khoản**:

   - Format: `{orderCode} {studentName}`
   - Example: `HP1729678901234 Nguyen Van A`
   - Phụ huynh phải ghi đúng nội dung này

3. **Số tiền**:

   - Tối thiểu: 1,000 VNĐ
   - Không được vượt quá số tiền còn lại của hóa đơn

4. **Webhook Security**:

   - Nên thêm xác thực signature từ Sepay
   - Kiểm tra IP nguồn

5. **Database Transaction**:
   - Luôn sử dụng transaction khi cập nhật Payment và FeeRecord
   - Đảm bảo tính toàn vẹn dữ liệu

## Troubleshooting

### 1. Webhook không hoạt động

- Kiểm tra URL webhook đã cấu hình đúng chưa
- Kiểm tra firewall/CORS
- Xem logs để debug

### 2. Số tiền không khớp

- Kiểm tra `amount_in` trong webhook
- Kiểm tra `amount` trong Payment record
- Có thể chấp nhận sai lệch nhỏ nếu cần

### 3. Không tìm thấy orderCode

- Kiểm tra format nội dung chuyển khoản
- Kiểm tra regex extract orderCode
- Xem logs webhook data

## Frontend Integration

### React Component Example

```typescript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

function PaymentQRModal({ feeRecordId, amount }) {
  const [qrData, setQrData] = useState(null);

  const createQRMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/payment/sepay/create-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (data) => {
      setQrData(data.data);
    }
  });

  const handleCreateQR = () => {
    createQRMutation.mutate({
      feeRecordId,
      amount,
      parentId: currentUser.id
    });
  };

  return (
    <div>
      <button onClick={handleCreateQR}>Tạo mã QR</button>

      {qrData && (
        <div>
          <img src={qrData.qrCodeUrl} alt="QR Code" />
          <p>Số tiền: {qrData.amount.toLocaleString('vi-VN')} VNĐ</p>
          <p>Nội dung: {qrData.content}</p>
          <p>Ngân hàng: {qrData.bankName}</p>
          <p>Số TK: {qrData.accountNumber}</p>
        </div>
      )}
    </div>
  );
}
```

## Support

Nếu có vấn đề, vui lòng liên hệ:

- Email: support@example.com
- Docs: https://docs.sepay.vn
