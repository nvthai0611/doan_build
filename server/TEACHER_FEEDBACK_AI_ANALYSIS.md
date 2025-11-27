# Phân Tích Feedback Giáo Viên Qua AI

## 📋 Tổng Quan

Hệ thống sử dụng **OpenAI GPT-3.5-turbo** để phân tích tổng hợp tất cả feedback của phụ huynh về giáo viên trong một lớp học, giúp quản lý trung tâm có cái nhìn tổng quan và phát hiện sớm các vấn đề nghiêm trọng.

---

## 🔄 Quy Trình Phân Tích AI

### Bước 1: Thu Thập Dữ Liệu
- Lấy **tất cả feedback đã được approve** (`status: 'approved'`) của lớp học
- Chỉ phân tích feedback đã được duyệt để đảm bảo chất lượng

### Bước 2: Chuẩn Hóa Dữ Liệu
Hệ thống tổng hợp các thông tin sau:
- **Rating**: Điểm đánh giá (1-5 sao)
- **Comment**: Nhận xét chi tiết từ phụ huynh
- **Categories**: Điểm đánh giá theo từng tiêu chí
  - `teaching_quality`: Chất lượng giảng dạy
  - `communication`: Giao tiếp
  - `punctuality`: Đúng giờ
  - `professionalism`: Chuyên nghiệp

### Bước 3: Tính Toán Thống Kê
- **Điểm trung bình tổng thể**: `avgRating`
- **Điểm trung bình từng category**: `avgCategories`
- **Tổng hợp tất cả comments**: Gộp tất cả nhận xét thành một chuỗi

### Bước 4: Gửi Request Đến OpenAI
- **Model**: `gpt-3.5-turbo`
- **Temperature**: `0.7` (cân bằng giữa sáng tạo và chính xác)
- **Max Tokens**: `2000` (đủ để trả về phân tích chi tiết)
- **Prompt**: Yêu cầu AI phân tích và trả về JSON với format cụ thể

### Bước 5: Xử Lý Response
- Parse JSON từ response của AI
- Tính toán `sentimentScore` dựa trên sentiment và avgRating
- Trả về kết quả phân tích hoàn chỉnh

---

## 📊 Format Dữ Liệu Output

### Cấu Trúc JSON Trả Về

```json
{
  "classId": "string",
  "className": "string",
  "sentiment": "positive" | "negative" | "neutral",
  "sentimentScore": number (1.0 - 5.0),
  "sentimentExplanation": "string",
  "overallAnalysis": "string",
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "recommendations": ["string", ...],
  "keyInsights": ["string", ...],
  "feedbackCount": number,
  "avgRating": number (1.0 - 5.0),
  "confidenceScore": number (0.0 - 1.0),
  "processingTimeMs": number
}
```

---

## 📝 Ý Nghĩa Từng Trường Dữ Liệu

### 1. **sentiment** (Cảm Xúc Tổng Thể)
- **`positive`**: Phụ huynh hài lòng, đánh giá tích cực
- **`negative`**: Phụ huynh không hài lòng, có nhiều phàn nàn
- **`neutral`**: Cảm xúc trung lập, không rõ ràng

**Cách xác định:**
- `positive`: avgRating >= 4.0
- `negative`: avgRating <= 2.5
- `neutral`: Còn lại

### 2. **sentimentScore** (Điểm Cảm Xúc)
- **Khoảng giá trị**: 1.0 - 5.0
- **Ý nghĩa**: Điểm số hóa cảm xúc, càng cao càng tích cực

**Công thức tính:**
- `positive`: `min(5.0, avgRating * 0.2 + 3.5)`
- `negative`: `max(1.0, avgRating * 0.2 + 1.5)`
- `neutral`: `clamp(2.0, 4.0, avgRating * 0.4 + 2.0)`

### 3. **sentimentExplanation** (Giải Thích Cảm Xúc)
- **Độ dài**: 3-4 câu
- **Nội dung**: Giải thích tổng quan về cảm xúc của phụ huynh dựa trên tất cả feedback
- **Ví dụ**: 
  - "Phụ huynh có cảm xúc tích cực với 8/10 feedback tích cực. Điểm đánh giá trung bình 4.2/5 cho thấy giáo viên được đánh giá tốt."

### 4. **overallAnalysis** (Phân Tích Tổng Hợp)
- **Độ dài**: 5-6 câu
- **Nội dung**: 
  - Tổng hợp điểm mạnh và điểm yếu được đề cập nhiều nhất
  - So sánh số lượng feedback tích cực vs tiêu cực
  - Đánh giá tổng thể về chất lượng giáo viên

**Ví dụ:**
> "Lớp Toán 10A có 15 feedback với điểm trung bình 3.8/5. Nhận được 9 feedback tích cực, cho thấy phụ huynh hài lòng. Tuy nhiên, có 4 feedback tiêu cực đề cập đến việc giáo viên thiếu nhiệt tình trong giảng dạy và giao tiếp với phụ huynh chưa tốt."

### 5. **strengths** (Điểm Mạnh)
- **Kiểu**: Mảng các chuỗi
- **Nội dung**: Các điểm mạnh được nhiều phụ huynh nhắc đến
- **Ví dụ**:
  ```json
  [
    "Giáo viên giảng dạy rõ ràng, dễ hiểu",
    "Nhiệt tình, quan tâm đến học sinh",
    "Giao tiếp tốt với phụ huynh"
  ]
  ```

### 6. **weaknesses** (Điểm Yếu)
- **Kiểu**: Mảng các chuỗi
- **Nội dung**: Các điểm yếu được nhiều phụ huynh phản ánh
- **Ví dụ**:
  ```json
  [
    "Thiếu nhiệt tình trong giảng dạy",
    "Giao tiếp với phụ huynh chưa tốt",
    "Đôi khi không đúng giờ"
  ]
  ```

### 7. **recommendations** (Khuyến Nghị)
- **Kiểu**: Mảng các chuỗi
- **Nội dung**: Các khuyến nghị dựa trên phân tích để cải thiện
- **Ví dụ**:
  ```json
  [
    "Nên có cuộc trao đổi với giáo viên để cải thiện chất lượng",
    "Cần cải thiện giao tiếp với phụ huynh",
    "Cần trao đổi ngay với phụ huynh và giáo viên để tìm hiểu nguyên nhân và giải pháp"
  ]
  ```

### 8. **keyInsights** (Insights Quan Trọng) ⚠️
- **Kiểu**: Mảng các chuỗi
- **Nội dung**: Các phát hiện quan trọng, đặc biệt là các tín hiệu cảnh báo

**Các Tín Hiệu Đặc Biệt Được Phát Hiện:**

#### ⚠️ **PHÁT HIỆN: Muốn Đổi Giáo Viên**
- **Từ khóa**: "đổi giáo viên", "thay giáo viên", "không muốn học với", "yêu cầu đổi"
- **Ý nghĩa**: Phụ huynh muốn thay đổi giáo viên - **CẦN XỬ LÝ NGAY**
- **Ví dụ**: `"⚠️ PHÁT HIỆN: Có 3 feedback đề cập đến việc muốn đổi/thay giáo viên - CẦN XỬ LÝ NGAY"`

#### ⚠️ **PHÁT HIỆN: Yêu Cầu Can Thiệp**
- **Từ khóa**: "can thiệp", "xử lý", "giải quyết", "quản lý", "lãnh đạo"
- **Ý nghĩa**: Phụ huynh yêu cầu sự can thiệp từ trung tâm/quản lý
- **Ví dụ**: `"⚠️ PHÁT HIỆN: Có 2 feedback yêu cầu can thiệp từ trung tâm/quản lý"`

#### ⚠️ **PHÁT HIỆN: Phàn Nàn Nghiêm Trọng**
- **Từ khóa**: "rất không hài lòng", "rất tệ", "không thể chấp nhận", "khiếu nại"
- **Ý nghĩa**: Phàn nàn ở mức độ cao - **MỨC ĐỘ CAO**
- **Ví dụ**: `"⚠️ PHÁT HIỆN: Có 4 feedback phàn nàn nghiêm trọng - MỨC ĐỘ CAO"`

#### ⚠️ **PHÁT HIỆN: Rút Học/Chuyển Lớp**
- **Từ khóa**: "rút học", "chuyển lớp", "nghỉ học", "không muốn học tiếp"
- **Ý nghĩa**: Rủi ro mất học sinh - **RỦI RO MẤT HỌC SINH**
- **Ví dụ**: `"⚠️ PHÁT HIỆN: Có 2 feedback đề cập đến việc rút học/chuyển lớp - RỦI RO MẤT HỌC SINH"`

#### ⚠️ **PHÁT HIỆN: Vấn Đề Đạo Đức/Hành Vi**
- **Từ khóa**: "thô lỗ", "thiếu tôn trọng", "không chuyên nghiệp", "hành vi không phù hợp"
- **Ý nghĩa**: Vấn đề về đạo đức/hành vi giáo viên - **CẦN ĐIỀU TRA**
- **Ví dụ**: `"⚠️ PHÁT HIỆN: Có 1 feedback phản ánh vấn đề về đạo đức/hành vi giáo viên - CẦN ĐIỀU TRA"`

**Ví dụ keyInsights:**
```json
[
  "Điểm đánh giá trung bình 3.8/5 cho thấy chất lượng ổn định",
  "Có sự phân cực trong đánh giá: 9 tích cực và 4 tiêu cực",
  "⚠️ PHÁT HIỆN: Có 3 feedback đề cập đến việc muốn đổi/thay giáo viên - CẦN XỬ LÝ NGAY"
]
```

### 9. **feedbackCount** (Số Lượng Feedback)
- **Kiểu**: Số nguyên
- **Ý nghĩa**: Tổng số feedback đã được phân tích
- **Ví dụ**: `15`

### 10. **avgRating** (Điểm Trung Bình)
- **Kiểu**: Số thực (1.0 - 5.0)
- **Ý nghĩa**: Điểm đánh giá trung bình từ tất cả feedback
- **Ví dụ**: `3.8`

### 11. **confidenceScore** (Độ Tin Cậy)
- **Kiểu**: Số thực (0.0 - 1.0)
- **Ý nghĩa**: Độ tin cậy của phân tích
  - **AI Analysis**: `0.85` (cao)
  - **Basic Analysis**: `0.7` (trung bình)

### 12. **processingTimeMs** (Thời Gian Xử Lý)
- **Kiểu**: Số nguyên (milliseconds)
- **Ý nghĩa**: Thời gian để hoàn thành phân tích
- **Ví dụ**: `2500` (2.5 giây)

---

## 🎯 Cách Sử Dụng Kết Quả Phân Tích

### 1. **Theo Dõi Sentiment Score**
- **>= 4.0**: Tốt, tiếp tục duy trì
- **3.0 - 4.0**: Ổn, có thể cải thiện
- **< 3.0**: Cần chú ý và cải thiện ngay

### 2. **Xử Lý Key Insights Có Cảnh Báo ⚠️**
- **Ưu tiên cao**: Các tín hiệu có dấu ⚠️ cần xử lý ngay
- **Liên hệ phụ huynh**: Nếu có tín hiệu rút học hoặc đổi giáo viên
- **Điều tra**: Nếu có vấn đề về đạo đức/hành vi

### 3. **Áp Dụng Recommendations**
- Sử dụng các khuyến nghị để cải thiện chất lượng giáo viên
- Trao đổi với giáo viên về các điểm yếu được phát hiện
- Tổ chức training nếu cần thiết

### 4. **Theo Dõi Xu Hướng**
- So sánh phân tích giữa các kỳ để xem có cải thiện không
- Theo dõi số lượng feedback tích cực vs tiêu cực

---

## 🔍 Ví Dụ Kết Quả Phân Tích

```json
{
  "classId": "class-123",
  "className": "Toán 10A",
  "sentiment": "positive",
  "sentimentScore": 4.2,
  "sentimentExplanation": "Phụ huynh có cảm xúc tích cực với 9/15 feedback tích cực. Điểm đánh giá trung bình 3.8/5 cho thấy giáo viên được đánh giá tốt.",
  "overallAnalysis": "Lớp Toán 10A có 15 feedback với điểm trung bình 3.8/5. Nhận được 9 feedback tích cực, cho thấy phụ huynh hài lòng. Tuy nhiên, có 4 feedback tiêu cực đề cập đến việc giáo viên thiếu nhiệt tình trong giảng dạy và giao tiếp với phụ huynh chưa tốt.",
  "strengths": [
    "Giảng dạy rõ ràng, dễ hiểu",
    "Nhiệt tình, quan tâm đến học sinh",
    "Đúng giờ, chuyên nghiệp"
  ],
  "weaknesses": [
    "Thiếu nhiệt tình trong giảng dạy (được 4 phụ huynh phản ánh)",
    "Giao tiếp với phụ huynh chưa tốt"
  ],
  "recommendations": [
    "Nên có cuộc trao đổi với giáo viên để cải thiện chất lượng",
    "Cần cải thiện giao tiếp với phụ huynh"
  ],
  "keyInsights": [
    "Điểm đánh giá trung bình 3.8/5 cho thấy chất lượng ổn định",
    "Có sự phân cực trong đánh giá: 9 tích cực và 4 tiêu cực",
    "⚠️ PHÁT HIỆN: Có 1 feedback đề cập đến việc muốn đổi giáo viên - CẦN XỬ LÝ NGAY"
  ],
  "feedbackCount": 15,
  "avgRating": 3.8,
  "confidenceScore": 0.85,
  "processingTimeMs": 2500
}
```

---

## 📌 Lưu Ý Quan Trọng

1. **Chỉ phân tích feedback đã được approve** để đảm bảo chất lượng
2. **AI Analysis có độ tin cậy cao hơn** (0.85 vs 0.7) nhưng cần API key
3. **Các tín hiệu cảnh báo ⚠️ cần được xử lý ngay** để tránh mất học sinh
4. **Kết quả được lưu vào database** để có thể xem lại và so sánh
5. **Phân tích chạy async** để không block request tạo feedback

---

## 🔗 Liên Kết

- **Service**: `teacher-feedback.service.ts`
- **Method chính**: `analyzeClassFeedbacks()`
- **AI Method**: `callOpenAIForClassFeedbacks()`
- **Basic Method**: `performBasicClassAnalysis()`

