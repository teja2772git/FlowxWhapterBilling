import * as XLSX from 'xlsx';
import type {
  IDataProvider,
  CategoryData,
  MenuItemData,
  OrderData,
  CustomerData,
  AppSettingsData,
  DailySummaryData,
} from './DataProvider';
import { ExcelDataProvider } from './ExcelDataProvider';

export class GoogleSheetsDataProvider implements IDataProvider {
  private fallbackExcelProvider = new ExcelDataProvider();
  private spreadsheetId: string;
  private webhookUrl: string | undefined;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '1Q-b8I8EwvzlqYetrQeBQFGmbJS58bWip96eKNG59VaM';
    this.webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    console.log(`[GoogleSheetsDataProvider] Active with Spreadsheet ID: ${this.spreadsheetId}`);
    if (this.webhookUrl) {
      console.log(`[GoogleSheetsDataProvider] Google Webhook URL active for 2-way live writes.`);
    }
  }

  private async fetchSheetCsv(sheetName: string): Promise<any[]> {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csvText = await res.text();
      if (csvText.startsWith('<!DOCTYPE html>')) {
        throw new Error('Google Sheet access restricted. Please set Share permission to "Anyone with link can view"');
      }
      const wb = XLSX.read(csvText, { type: 'string' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      return XLSX.utils.sheet_to_json(ws);
    } catch (err: any) {
      console.warn(`[GoogleSheetsDataProvider] Fetching Google Sheet "${sheetName}" failed: ${err.message}. Using local Excel database.`);
      return [];
    }
  }

  private async postToWebhook(action: string, payload: any): Promise<void> {
    if (!this.webhookUrl) return;
    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      console.log(`[GoogleSheetsDataProvider] Successfully posted ${action} to Google Sheets Webhook.`);
    } catch (err: any) {
      console.warn(`[GoogleSheetsDataProvider] Webhook post failed: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // CATEGORIES
  // ---------------------------------------------------------------------------
  async getCategories(): Promise<CategoryData[]> {
    const rows = await this.fetchSheetCsv('CATEGORIES');
    if (rows.length === 0) return this.fallbackExcelProvider.getCategories();
    return rows.map((r) => ({
      categoryId: String(r.categoryId || ''),
      categoryName: String(r.categoryName || ''),
      displayOrder: Number(r.displayOrder || 1),
      active: String(r.active).toUpperCase() === 'TRUE',
      createdAt: String(r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updatedAt || new Date().toISOString()),
    }));
  }

  async createCategory(cat: Omit<CategoryData, 'createdAt' | 'updatedAt'>): Promise<CategoryData> {
    const created = await this.fallbackExcelProvider.createCategory(cat);
    this.postToWebhook('createCategory', { category: created });
    return created;
  }

  async updateCategory(categoryId: string, updates: Partial<CategoryData>): Promise<CategoryData> {
    const updated = await this.fallbackExcelProvider.updateCategory(categoryId, updates);
    this.postToWebhook('updateCategory', { category: updated });
    return updated;
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const res = await this.fallbackExcelProvider.deleteCategory(categoryId);
    this.postToWebhook('deleteCategory', { categoryId });
    return res;
  }

  // ---------------------------------------------------------------------------
  // MENU
  // ---------------------------------------------------------------------------
  async getMenuItems(): Promise<MenuItemData[]> {
    const rows = await this.fetchSheetCsv('MENU');
    if (rows.length === 0) return this.fallbackExcelProvider.getMenuItems();
    return rows.map((r) => ({
      itemId: String(r.itemId || ''),
      categoryId: String(r.categoryId || ''),
      categoryName: String(r.categoryName || ''),
      itemName: String(r.itemName || ''),
      price: Number(r.price || 0),
      available: String(r.available).toUpperCase() === 'TRUE',
      displayOrder: Number(r.displayOrder || 1),
      notes: r.notes ? String(r.notes) : undefined,
      createdAt: String(r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updatedAt || new Date().toISOString()),
    }));
  }

  async createMenuItem(item: Omit<MenuItemData, 'itemId' | 'createdAt' | 'updatedAt'>): Promise<MenuItemData> {
    const created = await this.fallbackExcelProvider.createMenuItem(item);
    this.postToWebhook('createMenuItem', { item: created });
    return created;
  }

  async updateMenuItem(itemId: string, updates: Partial<MenuItemData>): Promise<MenuItemData> {
    const updated = await this.fallbackExcelProvider.updateMenuItem(itemId, updates);
    this.postToWebhook('updateMenuItem', { item: updated });
    return updated;
  }

  async deleteMenuItem(itemId: string): Promise<boolean> {
    const res = await this.fallbackExcelProvider.deleteMenuItem(itemId);
    this.postToWebhook('deleteMenuItem', { itemId });
    return res;
  }

  // ---------------------------------------------------------------------------
  // ORDERS
  // ---------------------------------------------------------------------------
  async getOrders(): Promise<OrderData[]> {
    return this.fallbackExcelProvider.getOrders();
  }

  async getActiveOrders(): Promise<OrderData[]> {
    return this.fallbackExcelProvider.getActiveOrders();
  }

  async getOrderById(orderId: string): Promise<OrderData | null> {
    return this.fallbackExcelProvider.getOrderById(orderId);
  }

  async createOrder(
    itemsInput: { itemId: string; quantity: number; notes?: string }[],
    customerName?: string,
    customerPhone?: string,
    discount?: number
  ): Promise<OrderData> {
    const order = await this.fallbackExcelProvider.createOrder(itemsInput, customerName, customerPhone, discount);
    this.postToWebhook('createOrder', { order });
    return order;
  }

  async updateOrder(orderId: string, updates: Partial<OrderData>): Promise<OrderData> {
    const updated = await this.fallbackExcelProvider.updateOrder(orderId, updates);
    this.postToWebhook('updateOrder', { order: updated });
    return updated;
  }

  async completeOrderItemUnit(orderItemId: string): Promise<OrderData> {
    const updated = await this.fallbackExcelProvider.completeOrderItemUnit(orderItemId);
    this.postToWebhook('completeOrderItemUnit', { orderItemId, order: updated });
    return updated;
  }

  async undoOrderItemUnit(orderItemId: string): Promise<OrderData> {
    const updated = await this.fallbackExcelProvider.undoOrderItemUnit(orderItemId);
    this.postToWebhook('undoOrderItemUnit', { orderItemId, order: updated });
    return updated;
  }

  // ---------------------------------------------------------------------------
  // CUSTOMERS
  // ---------------------------------------------------------------------------
  async getCustomers(): Promise<CustomerData[]> {
    return this.fallbackExcelProvider.getCustomers();
  }

  async createCustomer(cust: Omit<CustomerData, 'customerId' | 'createdAt' | 'updatedAt'>): Promise<CustomerData> {
    return this.fallbackExcelProvider.createCustomer(cust);
  }

  async updateCustomer(customerId: string, updates: Partial<CustomerData>): Promise<CustomerData> {
    return this.fallbackExcelProvider.updateCustomer(customerId, updates);
  }

  // ---------------------------------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------------------------------
  async getSettings(): Promise<AppSettingsData> {
    return this.fallbackExcelProvider.getSettings();
  }

  async updateSettings(settings: Partial<AppSettingsData>): Promise<AppSettingsData> {
    return this.fallbackExcelProvider.updateSettings(settings);
  }

  // ---------------------------------------------------------------------------
  // DAILY SUMMARY
  // ---------------------------------------------------------------------------
  async getDailySummary(): Promise<DailySummaryData[]> {
    return this.fallbackExcelProvider.getDailySummary();
  }
}
