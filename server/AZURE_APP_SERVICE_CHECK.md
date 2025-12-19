# Kiểm tra và Fix lỗi App Service không tồn tại

## Lỗi
```
Error: Resource nestjs-sep490-kkk of type Microsoft.Web/Sites doesn't exist.
```

## Nguyên nhân
App Service `nestjs-sep490-kkk` không tồn tại trong Resource Group `nestjis-rg`.

## Cách kiểm tra

### Bước 1: Kiểm tra App Service có tồn tại không

1. Vào [Azure Portal](https://portal.azure.com)
2. Tìm kiếm **"App Services"**
3. Kiểm tra xem có App Service nào tên `nestjs-sep490-kkk` không

### Bước 2: Kiểm tra Resource Group

1. Tìm kiếm **"Resource Groups"**
2. Vào Resource Group `nestjis-rg`
3. Xem danh sách App Services trong Resource Group này

## Giải pháp

### Nếu App Service KHÔNG tồn tại: Tạo mới

#### Cách 1: Tạo qua Azure Portal

1. Vào **App Services** → **Create**
2. Điền thông tin:
   - **Subscription**: Chọn subscription của bạn
   - **Resource Group**: `nestjis-rg` (hoặc tạo mới)
   - **Name**: `nestjs-sep490-kkk` (hoặc tên khác)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux (hoặc Windows)
   - **Region**: Chọn region gần nhất
3. Click **Review + create** → **Create**

#### Cách 2: Tạo qua Azure CLI

```bash
# Tạo App Service Plan (nếu chưa có)
az appservice plan create \
  --name nestjs-sep490-plan \
  --resource-group nestjis-rg \
  --sku B1 \
  --is-linux

# Tạo App Service
az webapp create \
  --resource-group nestjis-rg \
  --plan nestjs-sep490-plan \
  --name nestjs-sep490-kkk \
  --runtime "NODE:18-lts"
```

### Nếu App Service có tên KHÁC: Sửa workflow

1. Tìm tên App Service thực tế trong Azure Portal
2. Sửa file `server/.github/workflows/main.yml`:
   - Dòng 12: Thay `AZURE_APP_NAME` bằng tên App Service thực tế

### Nếu App Service ở Resource Group KHÁC: Sửa workflow

1. Tìm Resource Group thực tế của App Service
2. Sửa file `server/.github/workflows/main.yml`:
   - Dòng 13: Thay `AZURE_RESOURCE_GROUP` bằng tên Resource Group thực tế

## Sau khi fix

1. Commit và push thay đổi (nếu có sửa workflow)
2. Workflow sẽ tự động chạy lại
3. Hoặc trigger manual: Actions → Run workflow

