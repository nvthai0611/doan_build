# Tạo Azure App Service - Hướng dẫn nhanh

## Cách 1: Dùng Azure Portal (Dễ nhất)

1. Vào [Azure Portal](https://portal.azure.com)
2. Tìm kiếm **"App Services"** → **Create**
3. Điền thông tin:
   - **Subscription**: Subscription của bạn
   - **Resource Group**: `nestjs-rg` (hoặc tạo mới)
   - **Name**: `nestjs-sep490-kkk`
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Chọn region gần nhất (VD: Southeast Asia)
   - **App Service Plan**: Tạo mới hoặc chọn có sẵn
4. Click **Review + create** → **Create**

## Cách 2: Dùng Azure CLI (Nhanh)

### Mở Azure Cloud Shell

1. Vào [Azure Portal](https://portal.azure.com)
2. Click icon **Cloud Shell** (>)
3. Chọn **Bash**

### Chạy lệnh

```bash
# Set subscription
az account set --subscription 57aa97be-db9c-421e-a27c-957c97d7ec1c

# Tạo Resource Group (nếu chưa có)
az group create --name nestjs-rg --location southeastasia

# Tạo App Service Plan
az appservice plan create \
  --name nestjs-sep490-plan \
  --resource-group nestjs-rg \
  --sku B1 \
  --is-linux

# Tạo App Service
az webapp create \
  --resource-group nestjs-rg \
  --plan nestjs-sep490-plan \
  --name nestjs-sep490-kkk \
  --runtime "NODE:18-lts"

# Cấu hình App Service
az webapp config appsettings set \
  --resource-group nestjs-rg \
  --name nestjs-sep490-kkk \
  --settings \
    WEBSITE_NODE_DEFAULT_VERSION="~18" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Set startup command
az webapp config set \
  --resource-group nestjs-rg \
  --name nestjs-sep490-kkk \
  --startup-file "npm start"
```

## Cách 3: Dùng Script

1. Upload file `create-app-service.sh` lên Azure Cloud Shell
2. Chạy:
   ```bash
   chmod +x create-app-service.sh
   ./create-app-service.sh
   ```

## Sau khi tạo xong

1. Commit và push thay đổi workflow
2. Workflow sẽ tự động chạy lại
3. Hoặc trigger manual: GitHub → Actions → Run workflow

## Kiểm tra App Service

1. Vào [Azure Portal](https://portal.azure.com)
2. Tìm kiếm **"App Services"**
3. Tìm App Service `nestjs-sep490-kkk`
4. Click vào để xem chi tiết

## Lưu ý

- Tên App Service phải unique trên toàn Azure (không thể trùng)
- Nếu tên `nestjs-sep490-kkk` đã bị dùng, thử tên khác (VD: `nestjs-sep490-kkk-2024`)
- Nhớ cập nhật tên mới vào workflow file nếu đổi tên

