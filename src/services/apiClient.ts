import type { MenuItem, Category } from '../types/menu';
import type { Order } from '../types/order';
import type { AppSettings } from '../types/settings';

export const apiClient = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(cat: Category): Promise<Category> {
    const res = await fetch(`/api/categories/${cat.categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete category');
    const data = await res.json();
    return data.success;
  },

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error('Failed to fetch menu items');
    return res.json();
  },

  async createMenuItem(item: Omit<MenuItem, 'itemId' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return res.json();
  },

  async updateMenuItem(item: MenuItem): Promise<MenuItem> {
    const res = await fetch(`/api/menu/${item.itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  async updateItemPrice(itemId: string, price: number): Promise<MenuItem> {
    const res = await fetch(`/api/menu/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price }),
    });
    if (!res.ok) throw new Error('Failed to update item price');
    return res.json();
  },

  async deleteMenuItem(itemId: string): Promise<boolean> {
    const res = await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete menu item');
    const data = await res.json();
    return data.success;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getActiveOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders/active');
    if (!res.ok) throw new Error('Failed to fetch active orders');
    return res.json();
  },

  async createOrder(
    items: { itemId: string; quantity: number; notes?: string }[],
    customerName?: string,
    customerPhone?: string,
    discount?: number
  ): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, customerName, customerPhone, discount }),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async completeOrderItemUnit(orderItemId: string): Promise<Order> {
    const res = await fetch(`/api/order-items/${orderItemId}/complete`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to complete order item');
    return res.json();
  },

  async undoOrderItemUnit(orderItemId: string): Promise<Order> {
    const res = await fetch(`/api/order-items/${orderItemId}/undo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to undo order item');
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // File Download
  exportExcelWorkbook(): void {
    window.location.href = '/api/export';
  },
};
