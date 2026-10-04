# 🚀 GOOGLE SHEETS MIGRATION ARCHITECTURE GUIDE

This document provides step-by-step instructions for migrating the **FLOW — Flavours on Wheels** application from local Excel workbook storage (`/data/FLOW_POS.xlsx`) to a live **Google Sheets API** backend.

---

## 🏗️ Architecture Overview

The system uses a **DataProvider Abstraction Pattern**. Neither the React frontend nor the business logic knows whether data is read from local Excel or Google Sheets.

```text
                  FLOW POS React UI
                          │
                          ▼
                   REST API Backend
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
ExcelDataProvider              GoogleSheetsDataProvider
 (ACTIVE DEFAULT)                    (FUTURE MODE)
         │                                 │
         ▼                                 ▼
 /data/FLOW_POS.xlsx              Google Sheets API v4
```

---

## 📋 Step-by-Step Google Sheets Setup

### Step 1: Upload Workbook to Google Drive
1. Locate `/data/FLOW_POS.xlsx` in your project folder.
2. Open [Google Drive](https://drive.google.com).
3. Upload `FLOW_POS.xlsx` to Google Drive.
4. Right-click the uploaded file $\rightarrow$ **Open with** $\rightarrow$ **Google Sheets**.
5. Save the file as a native Google Sheet.
6. Copy the **Spreadsheet ID** from the browser URL bar:
   `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID_HERE>`**`/edit`

### Step 2: Set Up Google Cloud Platform Service Account
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `FLOW-POS-Backend`.
3. Enable the **Google Sheets API** and **Google Drive API**.
4. Go to **Credentials** $\rightarrow$ **Create Credentials** $\rightarrow$ **Service Account**.
5. Generate a new JSON key for the Service Account.
6. Open your Google Sheet in Google Drive, click **Share**, and grant `Editor` access to the Service Account email address (e.g. `flow-pos@project-id.iam.gserviceaccount.com`).

---

## ⚙️ Environment Variables Configuration

Create or update your `.env` file in the project root:

```env
# Switch Data Provider Mode to Google Sheets
DATA_PROVIDER=google_sheets

# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=flow-pos@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 📑 Required Sheet Names & Schemas (100% Compatible)

The Google Sheet **MUST** maintain the exact same sheet names and column headers as the Excel workbook:

1. **`CATEGORIES`**: `categoryId`, `categoryName`, `displayOrder`, `active`, `createdAt`, `updatedAt`
2. **`MENU`**: `itemId`, `categoryId`, `categoryName`, `itemName`, `price`, `available`, `displayOrder`, `notes`, `createdAt`, `updatedAt`
3. **`ORDERS`**: `orderId`, `orderNumber`, `createdAt`, `updatedAt`, `customerId`, `customerName`, `customerPhone`, `status`, `subtotal`, `discount`, `tax`, `grandTotal`, `totalItems`, `completedItems`, `remainingItems`, `priorityScore`, `priorityRank`, `completedAt`, `deliveredAt`, `cancelledAt`, `notes`
4. **`ORDER_ITEMS`**: `orderItemId`, `orderId`, `itemId`, `itemName`, `categoryName`, `unitPrice`, `quantity`, `completedQuantity`, `remainingQuantity`, `notes`, `createdAt`, `updatedAt`, `status`
5. **`CUSTOMERS`**: `customerId`, `customerName`, `phone`, `createdAt`, `updatedAt`, `totalOrders`, `totalSpent`
6. **`SETTINGS`**: `key`, `value`, `description`
7. **`DAILY_SUMMARY`**: `date`, `totalOrders`, `completedOrders`, `cancelledOrders`, `totalItems`, `completedItems`, `totalSales`, `averageOrderValue`, `averageWaitTime`, `updatedAt`

---

## 🔒 Security Best Practices

1. **Never expose Google credentials in the React frontend**.
2. All Google Sheets API calls are made server-side in `server/providers/GoogleSheetsDataProvider.ts`.
3. The React app connects only to relative REST API endpoints (`/api/...`).
