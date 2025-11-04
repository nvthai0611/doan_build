# Hướng dẫn Tạo Azure Service Principal - Chi tiết từng bước

## Cách 1: Sử dụng Azure Cloud Shell (Khuyến nghị - Dễ nhất)

### Bước 1: Mở Azure Cloud Shell

1. Đăng nhập vào [Azure Portal](https://portal.azure.com)
2. Click icon **Cloud Shell** (>) ở góc trên bên phải
3. Chọn **Bash** hoặc **PowerShell**

### Bước 2: Lấy Subscription ID

```bash
az account show --query id -o tsv
```

Copy kết quả (sẽ là một GUID như: `57aa97be-db9c-421e-a27c-957c97d7ec1c`)

### Bước 3: Tạo Service Principal

Thay thế `{SUBSCRIPTION_ID}` bằng Subscription ID vừa copy:

```bash
az ad sp create-for-rbac --name "github-actions-sep-deploy" \
  --role contributor \
  --scopes /subscriptions/{SUBSCRIPTION_ID}/resourceGroups/nestjis-rg \
  --sdk-auth
```

**Ví dụ:**
```bash
az ad sp create-for-rbac --name "github-actions-sep-deploy" \
  --role contributor \
  --scopes /subscriptions/57aa97be-db9c-421e-a27c-957c97d7ec1c/resourceGroups/nestjis-rg \
  --sdk-auth
```

### Bước 4: Copy Output JSON

Lệnh sẽ trả về JSON, copy TOÀN BỘ JSON đó (bao gồm dấu `{` và `}`)

```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

⚠️ **QUAN TRỌNG**: Lưu `clientSecret` ngay lập tức vì nó chỉ hiển thị 1 lần!

---

## Cách 2: Sử dụng Azure Portal (GUI)

### Bước 1: Tạo App Registration

1. Vào [Azure Portal](https://portal.azure.com)
2. Tìm kiếm **"Azure Active Directory"** hoặc **"Microsoft Entra ID"**
3. Vào **App registrations** → **New registration**
4. Điền:
   - **Name**: `github-actions-sep-deploy`
   - **Supported account types**: Chọn phù hợp
   - **Redirect URI**: Để trống
5. Click **Register**

### Bước 2: Tạo Client Secret

1. Trong App registration vừa tạo, vào **Certificates & secrets**
2. Click **New client secret**
3. Điền:
   - **Description**: `GitHub Actions Deployment`
   - **Expires**: Chọn thời hạn (VD: 24 months)
4. Click **Add**
5. **Copy ngay** giá trị `Value` (sẽ mất sau khi rời khỏi trang)

### Bước 3: Lấy các giá trị cần thiết

Trong trang **Overview** của App registration, copy:
- **Application (client) ID** → đây là `clientId`
- **Directory (tenant) ID** → đây là `tenantId`

### Bước 4: Lấy Subscription ID

1. Tìm kiếm **"Subscriptions"** trong Azure Portal
2. Click vào subscription của bạn
3. Copy **Subscription ID**

### Bước 5: Gán quyền Contributor

1. Vào **Resource Groups** → `nestjis-rg`
2. Click **Access control (IAM)**
3. Click **Add** → **Add role assignment**
4. Chọn:
   - **Role**: Contributor
   - **Assign access to**: App registration
   - **Select**: Chọn `github-actions-sep-deploy`
5. Click **Save**

### Bước 6: Tạo JSON cho GitHub

Tạo JSON với format sau (thay các giá trị):

```json
{
  "clientId": "PASTE_APPLICATION_CLIENT_ID_HERE",
  "clientSecret": "PASTE_CLIENT_SECRET_VALUE_HERE",
  "subscriptionId": "PASTE_SUBSCRIPTION_ID_HERE",
  "tenantId": "PASTE_DIRECTORY_TENANT_ID_HERE",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

---

## Bước tiếp theo: Thêm vào GitHub

1. Vào GitHub repository của bạn
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. **Name**: `AZURE_CREDENTIALS`
5. **Value**: Paste toàn bộ JSON từ trên
6. Click **Add secret**

---

## Kiểm tra

Sau khi thêm secret, workflow sẽ tự động chạy lại hoặc bạn có thể:
- Vào **Actions** tab
- Chọn workflow **"Deploy NestJS SERVER to Azure App Service"**
- Click **Run workflow** → **Run workflow**

