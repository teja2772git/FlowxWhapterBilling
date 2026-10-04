export interface CategoryData {
  categoryId: string;
  categoryName: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemData {
  itemId: string;
  categoryId: string;
  categoryName: string;
  itemName: string;
  price: number;
  available: boolean;
  displayOrder: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemData {
  orderItemId: string;
  orderId: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  unitPrice: number;
  quantity: number;
  completedQuantity: number;
  remainingQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface OrderData {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  totalItems: number;
  completedItems: number;
  remainingItems: number;
  priorityScore: number;
  priorityRank: number;
  completedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  notes?: string;
  items: OrderItemData[];
}

export interface CustomerData {
  customerId: string;
  customerName: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface AppSettingsData {
  [key: string]: any;
}

export interface DailySummaryData {
  date: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalItems: number;
  completedItems: number;
  totalSales: number;
  averageOrderValue: number;
  averageWaitTime: number;
  updatedAt: string;
}

export interface IDataProvider {
  // Categories
  getCategories(): Promise<CategoryData[]>;
  createCategory(cat: Omit<CategoryData, 'createdAt' | 'updatedAt'>): Promise<CategoryData>;
  updateCategory(categoryId: string, cat: Partial<CategoryData>): Promise<CategoryData>;
  deleteCategory(categoryId: string): Promise<boolean>;

  // Menu
  getMenuItems(): Promise<MenuItemData[]>;
  createMenuItem(item: Omit<MenuItemData, 'itemId' | 'createdAt' | 'updatedAt'>): Promise<MenuItemData>;
  updateMenuItem(itemId: string, item: Partial<MenuItemData>): Promise<MenuItemData>;
  deleteMenuItem(itemId: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<OrderData[]>;
  getActiveOrders(): Promise<OrderData[]>;
  getOrderById(orderId: string): Promise<OrderData | null>;
  createOrder(
    items: { itemId: string; quantity: number; notes?: string }[],
    customerName?: string,
    customerPhone?: string,
    discount?: number
  ): Promise<OrderData>;
  updateOrder(orderId: string, updates: Partial<OrderData>): Promise<OrderData>;
  completeOrderItemUnit(orderItemId: string): Promise<OrderData>;
  undoOrderItemUnit(orderItemId: string): Promise<OrderData>;

  // Customers
  getCustomers(): Promise<CustomerData[]>;
  createCustomer(cust: Omit<CustomerData, 'customerId' | 'createdAt' | 'updatedAt'>): Promise<CustomerData>;
  updateCustomer(customerId: string, cust: Partial<CustomerData>): Promise<CustomerData>;

  // Settings
  getSettings(): Promise<AppSettingsData>;
  updateSettings(settings: Partial<AppSettingsData>): Promise<AppSettingsData>;

  // Daily Summary
  getDailySummary(): Promise<DailySummaryData[]>;
}
