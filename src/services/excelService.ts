import * as XLSX from 'xlsx';
import type { MenuItem, Category } from '../types/menu';
import type { Order, OrderItem } from '../types/order';
import type { AppSettings } from '../types/settings';
import { INITIAL_MENU } from '../data/initialMenu';
import { INITIAL_CATEGORIES } from '../data/initialCategories';
import { INITIAL_SETTINGS } from '../data/initialSettings';

const STORAGE_KEY = 'flow_pos_excel_workbook_v2';

export interface ExcelDatabase {
  menu: MenuItem[];
  categories: Category[];
  orders: Order[];
  settings: AppSettings;
}

export function buildWorkbookFromData(data: ExcelDatabase): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. MENU SHEET
  const menuRows = data.menu.map((m) => ({
    itemId: m.itemId,
    categoryId: m.categoryId,
    categoryName: m.categoryName,
    itemName: m.itemName,
    price: m.price,
    available: m.available ? 'TRUE' : 'FALSE',
    displayOrder: m.displayOrder,
    note: m.note || '',
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  }));
  const wsMenu = XLSX.utils.json_to_sheet(menuRows);
  XLSX.utils.book_append_sheet(wb, wsMenu, 'MENU');

  // 2. ORDERS SHEET
  const orderRows = data.orders.map((o) => ({
    orderId: o.orderId,
    orderNumber: o.orderNumber,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    status: o.status,
    customerName: o.customerName || '',
    customerPhone: o.customerPhone || '',
    subtotal: o.subtotal,
    discount: o.discount,
    tax: o.tax,
    grandTotal: o.grandTotal,
    completedAt: o.completedAt || '',
  }));
  const wsOrders = XLSX.utils.json_to_sheet(orderRows);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'ORDERS');

  // 3. ORDER_ITEMS SHEET
  const itemRows: any[] = [];
  data.orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      itemRows.push({
        orderItemId: item.orderItemId,
        orderId: o.orderId,
        itemId: item.itemId,
        itemName: item.itemName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        completedQuantity: item.completedQuantity,
        remainingQuantity: item.remainingQuantity,
        notes: item.notes || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    });
  });
  const wsOrderItems = XLSX.utils.json_to_sheet(itemRows);
  XLSX.utils.book_append_sheet(wb, wsOrderItems, 'ORDER_ITEMS');

  // 4. SETTINGS SHEET
  const settingsRows = Object.entries(data.settings).map(([key, val]) => ({
    key,
    value: typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val),
  }));
  const wsSettings = XLSX.utils.json_to_sheet(settingsRows);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'SETTINGS');

  // 5. CATEGORIES SHEET
  const catRows = data.categories.map((c) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    displayOrder: c.displayOrder,
    active: c.active ? 'TRUE' : 'FALSE',
  }));
  const wsCategories = XLSX.utils.json_to_sheet(catRows);
  XLSX.utils.book_append_sheet(wb, wsCategories, 'CATEGORIES');

  return wb;
}

export function parseWorkbookToData(wb: XLSX.WorkBook): ExcelDatabase {
  let menu: MenuItem[] = [];
  let categories: Category[] = [];
  let orders: Order[] = [];
  let settings: AppSettings = { ...INITIAL_SETTINGS };

  if (wb.SheetNames.includes('CATEGORIES')) {
    const wsCat = wb.Sheets['CATEGORIES'];
    const rows: any[] = XLSX.utils.sheet_to_json(wsCat);
    categories = rows.map((r) => ({
      categoryId: String(r.categoryId || ''),
      categoryName: String(r.categoryName || ''),
      displayOrder: Number(r.displayOrder || 1),
      active: String(r.active).toUpperCase() === 'TRUE',
    }));
  }
  if (categories.length === 0) {
    categories = [...INITIAL_CATEGORIES];
  }

  if (wb.SheetNames.includes('MENU')) {
    const wsMenu = wb.Sheets['MENU'];
    const rows: any[] = XLSX.utils.sheet_to_json(wsMenu);
    menu = rows.map((r) => ({
      itemId: String(r.itemId || ''),
      categoryId: String(r.categoryId || ''),
      categoryName: String(r.categoryName || ''),
      itemName: String(r.itemName || ''),
      price: Number(r.price || 0),
      available: String(r.available).toUpperCase() === 'TRUE',
      displayOrder: Number(r.displayOrder || 1),
      note: r.note ? String(r.note) : undefined,
      createdAt: String(r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updatedAt || new Date().toISOString()),
    }));
  }
  if (menu.length === 0) {
    menu = [...INITIAL_MENU];
  }

  if (wb.SheetNames.includes('SETTINGS')) {
    const wsSettings = wb.Sheets['SETTINGS'];
    const rows: any[] = XLSX.utils.sheet_to_json(wsSettings);
    const parsedSettings: any = { ...INITIAL_SETTINGS };
    rows.forEach((r) => {
      if (r.key && r.value !== undefined) {
        const valStr = String(r.value);
        if (valStr.toUpperCase() === 'TRUE') parsedSettings[r.key] = true;
        else if (valStr.toUpperCase() === 'FALSE') parsedSettings[r.key] = false;
        else if (!isNaN(Number(valStr)) && valStr.trim() !== '') parsedSettings[r.key] = Number(valStr);
        else parsedSettings[r.key] = valStr;
      }
    });
    settings = parsedSettings;
  }

  const rawOrderItemsMap = new Map<string, OrderItem[]>();
  if (wb.SheetNames.includes('ORDER_ITEMS')) {
    const wsItems = wb.Sheets['ORDER_ITEMS'];
    const rows: any[] = XLSX.utils.sheet_to_json(wsItems);
    rows.forEach((r) => {
      const item: OrderItem = {
        orderItemId: String(r.orderItemId || ''),
        orderId: String(r.orderId || ''),
        itemId: String(r.itemId || ''),
        itemName: String(r.itemName || ''),
        unitPrice: Number(r.unitPrice || 0),
        quantity: Number(r.quantity || 1),
        completedQuantity: Number(r.completedQuantity || 0),
        remainingQuantity: Number(r.remainingQuantity ?? (Number(r.quantity || 1) - Number(r.completedQuantity || 0))),
        notes: r.notes ? String(r.notes) : undefined,
        createdAt: String(r.createdAt || new Date().toISOString()),
        updatedAt: String(r.updatedAt || new Date().toISOString()),
      };
      if (!rawOrderItemsMap.has(item.orderId)) {
        rawOrderItemsMap.set(item.orderId, []);
      }
      rawOrderItemsMap.get(item.orderId)!.push(item);
    });
  }

  if (wb.SheetNames.includes('ORDERS')) {
    const wsOrders = wb.Sheets['ORDERS'];
    const rows: any[] = XLSX.utils.sheet_to_json(wsOrders);
    orders = rows.map((r) => {
      const orderId = String(r.orderId || '');
      const items = rawOrderItemsMap.get(orderId) || [];
      return {
        orderId,
        orderNumber: String(r.orderNumber || orderId),
        createdAt: String(r.createdAt || new Date().toISOString()),
        updatedAt: String(r.updatedAt || new Date().toISOString()),
        status: String(r.status || 'PENDING') as any,
        customerName: r.customerName ? String(r.customerName) : undefined,
        customerPhone: r.customerPhone ? String(r.customerPhone) : undefined,
        subtotal: Number(r.subtotal || 0),
        discount: Number(r.discount || 0),
        tax: Number(r.tax || 0),
        grandTotal: Number(r.grandTotal || 0),
        completedAt: r.completedAt ? String(r.completedAt) : null,
        items,
      };
    });
  }

  return { menu, categories, orders, settings };
}

export const excelService = {
  saveToLocalStorage(data: ExcelDatabase): void {
    try {
      const wb = buildWorkbookFromData(data);
      const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
      localStorage.setItem(STORAGE_KEY, b64);
    } catch (err) {
      console.error('Failed to save Excel workbook to LocalStorage:', err);
    }
  },

  loadFromLocalStorage(): ExcelDatabase {
    try {
      const b64 = localStorage.getItem(STORAGE_KEY);
      if (b64) {
        const wb = XLSX.read(b64, { type: 'base64' });
        return parseWorkbookToData(wb);
      }
    } catch (err) {
      console.error('Failed to load Excel workbook from LocalStorage:', err);
    }
    return {
      menu: [...INITIAL_MENU],
      categories: [...INITIAL_CATEGORIES],
      orders: [],
      settings: { ...INITIAL_SETTINGS },
    };
  },

  downloadExcelFile(data: ExcelDatabase, filename = 'FLOW_Flavours_On_Wheels_Database.xlsx'): void {
    const wb = buildWorkbookFromData(data);
    XLSX.writeFile(wb, filename);
  },

  async readExcelFile(file: File): Promise<ExcelDatabase> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const parsed = parseWorkbookToData(wb);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  },

  clearLocalStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
