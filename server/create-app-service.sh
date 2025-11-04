#!/bin/bash

# Script tạo Azure App Service cho NestJS backend
# Chạy lệnh này trong Azure Cloud Shell hoặc máy đã cài Azure CLI

echo "=== Tạo Azure App Service cho NestJS ==="

# Cấu hình
SUBSCRIPTION_ID="57aa97be-db9c-421e-a27c-957c97d7ec1c"
RESOURCE_GROUP="nestjs-rg"
APP_SERVICE_NAME="nestjs-sep490-kkk"
APP_SERVICE_PLAN="nestjs-sep490-plan"
REGION="southeastasia"  # Thay đổi theo region của bạn (VD: eastus, westus2, etc.)

echo "Resource Group: $RESOURCE_GROUP"
echo "App Service Name: $APP_SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Bước 1: Set subscription
echo "1. Setting subscription..."
az account set --subscription $SUBSCRIPTION_ID

# Bước 2: Kiểm tra Resource Group có tồn tại không
echo "2. Checking Resource Group..."
if ! az group show --name $RESOURCE_GROUP &>/dev/null; then
  echo "   Resource Group không tồn tại. Đang tạo..."
  az group create --name $RESOURCE_GROUP --location $REGION
else
  echo "   Resource Group đã tồn tại."
fi

# Bước 3: Kiểm tra App Service Plan có tồn tại không
echo "3. Checking App Service Plan..."
if ! az appservice plan show --name $APP_SERVICE_PLAN --resource-group $RESOURCE_GROUP &>/dev/null; then
  echo "   App Service Plan không tồn tại. Đang tạo..."
  az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux
else
  echo "   App Service Plan đã tồn tại."
fi

# Bước 4: Kiểm tra App Service có tồn tại không
echo "4. Checking App Service..."
if ! az webapp show --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP &>/dev/null; then
  echo "   App Service không tồn tại. Đang tạo..."
  az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $APP_SERVICE_NAME \
    --runtime "NODE:18-lts"
  
  echo "   ✅ App Service đã được tạo thành công!"
else
  echo "   App Service đã tồn tại."
fi

# Bước 5: Cấu hình App Service
echo "5. Configuring App Service..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --settings \
    WEBSITE_NODE_DEFAULT_VERSION="~18" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Bước 6: Cấu hình startup command
echo "6. Setting startup command..."
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_SERVICE_NAME \
  --startup-file "npm start"

echo ""
echo "=== Hoàn thành ==="
echo "App Service URL: https://${APP_SERVICE_NAME}.azurewebsites.net"
echo ""
echo "Bạn có thể kiểm tra trên Azure Portal:"
echo "https://portal.azure.com/#@/resource/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Web/sites/${APP_SERVICE_NAME}"

