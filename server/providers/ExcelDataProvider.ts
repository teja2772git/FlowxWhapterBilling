import { ExcelService } from '../services/ExcelService';
import type {
  IDataProvider,
  CategoryData,
  MenuItemData,
  OrderData,
  OrderItemData,
  CustomerData,
  AppSettingsData,
  DailySummaryData,
} from './DataProvider';

export class ExcelDataProvider implements IDataProvider {
  private excelService = ExcelService.getInstance();

  // Helper to parse boolean strings
  private parseBool(val: any): boolean {
    if (typeof val === 'boolean') return val;
    return String(val).toUpperCase() === 'TRUE';
  }

  // ---------------------------------------------------------------------------
  // CATEGORIES
  // ---------------------------------------------------------------------------
  async getCategories(): Promise<CategoryData[]> {
    const rows = await this.excelService.readSheet<any>('CATEGORIES');
    return rows.map((r) => ({
      categoryId: String(r.categoryId || ''),
      categoryName: String(r.categoryName || ''),
      displayOrder: Number(r.displayOrder || 1),
      active: this.parseBool(r.active),
      createdAt: String(r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updatedAt || new Date().toISOString()),
    }));
  }

  async createCategory(cat: Omit<CategoryData, 'createdAt' | 'updatedAt'>): Promise<CategoryData> {
    const categories = await this.getCategories();
    const now = new Date().toISOString();
    const newCat: CategoryData = {
      ...cat,
      createdAt: now,
      updatedAt: now,
    };
    categories.push(newCat);
    await this.excelService.updateSheets({ CATEGORIES: categories });
    return newCat;
  }

  async updateCategory(categoryId: string, updates: Partial<CategoryData>): Promise<CategoryData> {
    const categories = await this.getCategories();
    const idx = categories.findIndex((c) => c.categoryId === categoryId);
    if (idx === -1) {
      throw new Error(`Category ${categoryId} not found`);
    }
    const updated: CategoryData = {
      ...categories[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    categories[idx] = updated;
    await this.excelService.updateSheets({ CATEGORIES: categories });
    return updated;
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    let categories = await this.getCategories();
    const initLen = categories.length;
    categories = categories.filter((c) => c.categoryId !== categoryId);
    if (categories.length === initLen) return false;
    await this.excelService.updateSheets({ CATEGORIES: categories });
    return true;
  }

  // ---------------------------------------------------------------------------
  // MENU
  // ---------------------------------------------------------------------------
  async getMenuItems(): Promise<MenuItemData[]> {
    const rows = await this.excelService.readSheet<any>('MENU');
    return rows.map((r) => ({
      itemId: String(r.itemId || ''),
      categoryId: String(r.categoryId || ''),
      categoryName: String(r.categoryName || ''),
      itemName: String(r.itemName || ''),
      price: Number(r.price || 0),
      available: this.parseBool(r.available),
      displayOrder: Number(r.displayOrder || 1),
      notes: r.notes ? String(r.notes) : undefined,
      createdAt: String(r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updatedAt || new Date().toISOString()),
    }));
  }

  async createMenuItem(item: Omit<MenuItemData, 'itemId' | 'createdAt' | 'updatedAt'>): Promise<MenuItemData> {
    const menu = await this.getMenuItems();
    const now = new Date().toISOString();
    const newItem: MenuItemData = {
      ...item,
      itemId: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    menu.push(newItem);
    await this.excelService.updateSheets({ MENU: menu });
    return newItem;
  }

  async updateMenuItem(itemId: string, updates: Partial<MenuItemData>): Promise<MenuItemData> {
    const menu = await this.getMenuItems();
    const idx = menu.findIndex((m) => m.itemId === itemId);
    if (idx === -1) {
      throw new Error(`Menu item ${itemId} not found`);
    }
    const updated: MenuItemData = {
      ...menu[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    menu[idx] = updated;
    await this.excelService.updateSheets({ MENU: menu });
    return updated;
  }

  async deleteMenuItem(itemId: string): Promise<boolean> {
    let menu = await this.getMenuItems();
    const initLen = menu.length;
    menu = menu.filter((m) => m.itemId !== itemId);
    if (menu.length === initLen) return false;
    await this.excelService.updateSheets({ MENU: menu });
    return true;
  }

  // ---------------------------------------------------------------------------
  // ORDERS & ORDER_ITEMS
  // ---------------------------------------------------------------------------
  async getOrders(): Promise<OrderData[]> {
    const orderRows = await this.excelService.readSheet<any>('ORDERS');
    const itemRows = await this.excelService.readSheet<any>('ORDER_ITEMS');

    const itemsMap = new Map<string, OrderItemData[]>();
    itemRows.forEach((r) => {
      const item: OrderItemData = {
        orderItemId: String(r.orderItemId || ''),
        orderId: String(r.orderId || ''),
        itemId: String(r.itemId || ''),
        itemName: String(r.itemName || ''),
        categoryName: String(r.categoryName || ''),
        unitPrice: Number(r.unitPrice || 0),
        quantity: Number(r.quantity || 1),
        completedQuantity: Number(r.completedQuantity || 0),
        remainingQuantity: Number(r.remainingQuantity ?? (Number(r.quantity || 1) - Number(r.completedQuantity || 0))),
        notes: r.notes ? String(r.notes) : undefined,
        createdAt: String(r.createdAt || new Date().toISOString()),
        updatedAt: String(r.updatedAt || new Date().toISOString()),
        status: String(r.status || 'PENDING'),
      };
      if (!itemsMap.has(item.orderId)) {
        itemsMap.set(item.orderId, []);
      }
      itemsMap.get(item.orderId)!.push(item);
    });

    const orders: OrderData[] = orderRows.map((r) => {
      const orderId = String(r.orderId || '');
      const items = itemsMap.get(orderId) || [];
      return {
        orderId,
        orderNumber: String(r.orderNumber || orderId),
        createdAt: String(r.createdAt || new Date().toISOString()),
        updatedAt: String(r.updatedAt || new Date().toISOString()),
        customerId: String(r.customerId || 'cust_walkin'),
        customerName: String(r.customerName || 'Walk-in Customer'),
        customerPhone: String(r.customerPhone || ''),
        status: String(r.status || 'PENDING'),
        subtotal: Number(r.subtotal || 0),
        discount: Number(r.discount || 0),
        tax: Number(r.tax || 0),
        grandTotal: Number(r.grandTotal || 0),
        totalItems: Number(r.totalItems || items.reduce((sum, i) => sum + i.quantity, 0)),
        completedItems: Number(r.completedItems || items.reduce((sum, i) => sum + i.completedQuantity, 0)),
        remainingItems: Number(r.remainingItems || items.reduce((sum, i) => sum + i.remainingQuantity, 0)),
        priorityScore: Number(r.priorityScore || 0),
        priorityRank: Number(r.priorityRank || 0),
        completedAt: r.completedAt ? String(r.completedAt) : undefined,
        deliveredAt: r.deliveredAt ? String(r.deliveredAt) : undefined,
        cancelledAt: r.cancelledAt ? String(r.cancelledAt) : undefined,
        notes: r.notes ? String(r.notes) : undefined,
        items,
      };
    });

    return orders;
  }

  async getActiveOrders(): Promise<OrderData[]> {
    const orders = await this.getOrders();
    return orders.filter((o) => o.status === 'PENDING' || o.status === 'IN_PROGRESS');
  }

  async getOrderById(orderId: string): Promise<OrderData | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.orderId === orderId) || null;
  }

  async createOrder(
    itemsInput: { itemId: string; quantity: number; notes?: string }[],
    customerName = 'Walk-in Customer',
    customerPhone = '',
    discount = 0
  ): Promise<OrderData> {
    const menu = await this.getMenuItems();
    const settings = await this.getSettings();
    const orders = await this.getOrders();
    const now = new Date().toISOString();

    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(orders.length + 1).padStart(4, '0');
    const orderId = `ORD-${datePrefix}-${seq}`;
    const orderNumber = `FL-${seq.slice(-3)}`;

    let subtotal = 0;
    let totalItems = 0;

    const orderItems: OrderItemData[] = itemsInput.map((inp, idx) => {
      const menuObj = menu.find((m) => m.itemId === inp.itemId);
      const unitPrice = menuObj ? menuObj.price : 0;
      const itemName = menuObj ? menuObj.itemName : 'Unknown Item';
      const categoryName = menuObj ? menuObj.categoryName : 'GENERAL';
      const qty = Math.max(1, inp.quantity);

      subtotal += unitPrice * qty;
      totalItems += qty;

      return {
        orderItemId: `OI-${datePrefix}-${seq}-${idx + 1}`,
        orderId,
        itemId: inp.itemId,
        itemName,
        categoryName,
        unitPrice,
        quantity: qty,
        completedQuantity: 0,
        remainingQuantity: qty,
        notes: inp.notes || '',
        createdAt: now,
        updatedAt: now,
        status: 'PENDING',
      };
    });

    const disc = Math.max(0, discount);
    const taxable = Math.max(0, subtotal - disc);
    const taxRate = settings.taxEnabled ? (settings.taxPercentage || 0) / 100 : 0;
    const tax = Math.round(taxable * taxRate);
    const grandTotal = Math.round(taxable + tax);

    const newOrder: OrderData = {
      orderId,
      orderNumber,
      createdAt: now,
      updatedAt: now,
      customerId: 'cust_walkin',
      customerName,
      customerPhone,
      status: 'PENDING',
      subtotal,
      discount: disc,
      tax,
      grandTotal,
      totalItems,
      completedItems: 0,
      remainingItems: totalItems,
      priorityScore: 0,
      priorityRank: 0,
      items: orderItems,
    };

    // Flatten all existing + new order rows
    const allOrders = [...orders, newOrder];
    const allOrderRows = allOrders.map(({ items, ...o }) => o);

    const existingItemRows = await this.excelService.readSheet<any>('ORDER_ITEMS');
    const allItemRows = [...existingItemRows, ...orderItems];

    await this.excelService.updateSheets({
      ORDERS: allOrderRows,
      ORDER_ITEMS: allItemRows,
    });

    return newOrder;
  }

  async updateOrder(orderId: string, updates: Partial<OrderData>): Promise<OrderData> {
    const orders = await this.getOrders();
    const idx = orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) {
      throw new Error(`Order ${orderId} not found`);
    }

    const current = orders[idx];
    const updated: OrderData = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    orders[idx] = updated;

    const allOrderRows = orders.map(({ items, ...o }) => o);
    await this.excelService.updateSheets({ ORDERS: allOrderRows });

    return updated;
  }

  async completeOrderItemUnit(orderItemId: string): Promise<OrderData> {
    const orders = await this.getOrders();
    let targetOrder: OrderData | null = null;
    let targetItem: OrderItemData | null = null;

    for (const o of orders) {
      const found = o.items.find((i) => i.orderItemId === orderItemId);
      if (found) {
        targetOrder = o;
        targetItem = found;
        break;
      }
    }

    if (!targetOrder || !targetItem) {
      throw new Error(`Order item ${orderItemId} not found`);
    }

    if (targetItem.remainingQuantity > 0) {
      targetItem.completedQuantity += 1;
      targetItem.remainingQuantity -= 1;
      targetItem.updatedAt = new Date().toISOString();
      if (targetItem.remainingQuantity === 0) {
        targetItem.status = 'COMPLETED';
      } else {
        targetItem.status = 'IN_PROGRESS';
      }
    }

    // Recalculate parent order metrics
    let completedItems = 0;
    let remainingItems = 0;
    targetOrder.items.forEach((i) => {
      completedItems += i.completedQuantity;
      remainingItems += i.remainingQuantity;
    });

    targetOrder.completedItems = completedItems;
    targetOrder.remainingItems = remainingItems;
    targetOrder.updatedAt = new Date().toISOString();

    if (remainingItems === 0) {
      targetOrder.status = 'READY';
      targetOrder.completedAt = new Date().toISOString();
    } else {
      targetOrder.status = 'IN_PROGRESS';
    }

    // Save updated sheets
    const allOrderRows = orders.map(({ items, ...o }) => o);
    const allItemRows: OrderItemData[] = [];
    orders.forEach((o) => allItemRows.push(...o.items));

    await this.excelService.updateSheets({
      ORDERS: allOrderRows,
      ORDER_ITEMS: allItemRows,
    });

    return targetOrder;
  }

  async undoOrderItemUnit(orderItemId: string): Promise<OrderData> {
    const orders = await this.getOrders();
    let targetOrder: OrderData | null = null;
    let targetItem: OrderItemData | null = null;

    for (const o of orders) {
      const found = o.items.find((i) => i.orderItemId === orderItemId);
      if (found) {
        targetOrder = o;
        targetItem = found;
        break;
      }
    }

    if (!targetOrder || !targetItem) {
      throw new Error(`Order item ${orderItemId} not found`);
    }

    if (targetItem.completedQuantity > 0) {
      targetItem.completedQuantity -= 1;
      targetItem.remainingQuantity += 1;
      targetItem.updatedAt = new Date().toISOString();
      targetItem.status = targetItem.completedQuantity === 0 ? 'PENDING' : 'IN_PROGRESS';
    }

    // Recalculate parent order metrics
    let completedItems = 0;
    let remainingItems = 0;
    targetOrder.items.forEach((i) => {
      completedItems += i.completedQuantity;
      remainingItems += i.remainingQuantity;
    });

    targetOrder.completedItems = completedItems;
    targetOrder.remainingItems = remainingItems;
    targetOrder.updatedAt = new Date().toISOString();
    targetOrder.status = completedItems === 0 ? 'PENDING' : 'IN_PROGRESS';
    targetOrder.completedAt = undefined;

    const allOrderRows = orders.map(({ items, ...o }) => o);
    const allItemRows: OrderItemData[] = [];
    orders.forEach((o) => allItemRows.push(...o.items));

    await this.excelService.updateSheets({
      ORDERS: allOrderRows,
      ORDER_ITEMS: allItemRows,
    });

    return targetOrder;
  }

  // ---------------------------------------------------------------------------
  // CUSTOMERS
  // ---------------------------------------------------------------------------
  async getCustomers(): Promise<CustomerData[]> {
    const rows = await this.excelService.readSheet<any>('CUSTOMERS');
    return rows.map((r) => ({
      customerId: String(r.customerId || ''),
      customerName: String(r.customerName || ''),
      phone: String(r.phone || ''),
      createdAt: String(r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updatedAt || new Date().toISOString()),
      totalOrders: Number(r.totalOrders || 0),
      totalSpent: Number(r.totalSpent || 0),
    }));
  }

  async createCustomer(cust: Omit<CustomerData, 'customerId' | 'createdAt' | 'updatedAt'>): Promise<CustomerData> {
    const customers = await this.getCustomers();
    const now = new Date().toISOString();
    const newCust: CustomerData = {
      ...cust,
      customerId: `cust_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    customers.push(newCust);
    await this.excelService.updateSheets({ CUSTOMERS: customers });
    return newCust;
  }

  async updateCustomer(customerId: string, updates: Partial<CustomerData>): Promise<CustomerData> {
    const customers = await this.getCustomers();
    const idx = customers.findIndex((c) => c.customerId === customerId);
    if (idx === -1) {
      throw new Error(`Customer ${customerId} not found`);
    }
    const updated: CustomerData = {
      ...customers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    customers[idx] = updated;
    await this.excelService.updateSheets({ CUSTOMERS: customers });
    return updated;
  }

  // ---------------------------------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------------------------------
  async getSettings(): Promise<AppSettingsData> {
    const rows = await this.excelService.readSheet<any>('SETTINGS');
    const settings: AppSettingsData = {
      restaurantName: 'FLOW — Flavours on Wheels',
      restaurantTagline: 'Food Truck • Café • Catering',
      currency: 'INR',
      currencySymbol: '₹',
      taxEnabled: false,
      taxPercentage: 0,
      priorityAgingWeight: 2.5,
      priorityWorkloadWeight: 1.2,
      priorityCompletionWeight: 1.8,
      antiStarvationThreshold: 25,
    };

    rows.forEach((r) => {
      if (r.key && r.value !== undefined) {
        const valStr = String(r.value);
        if (valStr.toUpperCase() === 'TRUE') settings[r.key] = true;
        else if (valStr.toUpperCase() === 'FALSE') settings[r.key] = false;
        else if (!isNaN(Number(valStr)) && valStr.trim() !== '') settings[r.key] = Number(valStr);
        else settings[r.key] = valStr;
      }
    });

    return settings;
  }

  async updateSettings(newSettings: Partial<AppSettingsData>): Promise<AppSettingsData> {
    const current = await this.getSettings();
    const updated = { ...current, ...newSettings };

    const settingsRows = Object.entries(updated).map(([key, value]) => ({
      key,
      value: typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : String(value),
      description: 'Configuration setting',
    }));

    await this.excelService.updateSheets({ SETTINGS: settingsRows });
    return updated;
  }

  // ---------------------------------------------------------------------------
  // DAILY SUMMARY
  // ---------------------------------------------------------------------------
  async getDailySummary(): Promise<DailySummaryData[]> {
    const orders = await this.getOrders();
    const summaryMap = new Map<string, DailySummaryData>();

    orders.forEach((o) => {
      const dateStr = o.createdAt.slice(0, 10);
      if (!summaryMap.has(dateStr)) {
        summaryMap.set(dateStr, {
          date: dateStr,
          totalOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalItems: 0,
          completedItems: 0,
          totalSales: 0,
          averageOrderValue: 0,
          averageWaitTime: 0,
          updatedAt: new Date().toISOString(),
        });
      }

      const summary = summaryMap.get(dateStr)!;
      summary.totalOrders += 1;
      if (o.status === 'READY' || o.status === 'COMPLETED' || o.status === 'DELIVERED') {
        summary.completedOrders += 1;
        summary.totalSales += o.grandTotal;
      } else if (o.status === 'CANCELLED') {
        summary.cancelledOrders += 1;
      }
      summary.totalItems += o.totalItems;
      summary.completedItems += o.completedItems;
    });

    const summaries = Array.from(summaryMap.values()).map((s) => ({
      ...s,
      averageOrderValue: s.completedOrders > 0 ? Math.round(s.totalSales / s.completedOrders) : 0,
    }));

    await this.excelService.updateSheets({ DAILY_SUMMARY: summaries });
    return summaries;
  }
}
