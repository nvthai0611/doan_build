# Hướng dẫn Setup Azure Credentials cho GitHub Actions

## Vấn đề
Lỗi: `Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied`

## Giải pháp

### Bước 1: Tạo Azure Service Principal

Chạy lệnh sau trong Azure CLI (hoặc Azure Cloud Shell):

```bash
# Đăng nhập vào Azure
az login

# Tạo Service Principal với quyền Contributor
az ad sp create-for-rbac --name "github-actions-sep-deploy" \
  --role contributor \
  --scopes /subscriptions/{SUBSCRIPTION_ID}/resourceGroups/{RESOURCE_GROUP_NAME} \
  --sdk-auth
```

**Thay thế:**
- `{SUBSCRIPTION_ID}`: ID của subscription Azure của bạn
- `{RESOURCE_GROUP_NAME}`: Tên Resource Group (VD: `nestjis-rg`)

### Bước 2: Copy Output JSON

Lệnh trên sẽ trả về JSON như sau:

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

### Bước 3: Thêm Secret vào GitHub

1. Vào GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `AZURE_CREDENTIALS`
5. Value: Paste toàn bộ JSON output từ Bước 2
6. Click "Add secret"

### Bước 4: Kiểm tra

Sau khi thêm secret, workflow sẽ tự động chạy lại hoặc bạn có thể trigger manual.

## Lưu ý

- **Không commit** file này vào Git
- **Không share** Service Principal credentials
- Nếu Service Principal bị xóa, cần tạo lại và update secret

## Troubleshooting

### Lỗi: "Authorization failed"
- Kiểm tra Service Principal có quyền Contributor trên Resource Group
- Kiểm tra subscription ID đúng

### Lỗi: "App Service not found"
- Kiểm tra `AZURE_APP_NAME` trong workflow file đúng với tên App Service
- Kiểm tra App Service nằm trong Resource Group đã chỉ định

