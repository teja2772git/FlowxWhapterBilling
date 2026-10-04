export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  itemId: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  completedQuantity: number;
  remainingQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriorityBreakdown {
  priorityRank: number;
  priorityScore: number;
  agingScore: number;
  workloadScore: number;
  completionBonus: number;
  starvationBoost: number;
  remainingItems: number;
  completedItems: number;
  totalItems: number;
  waitMinutes: number;
  priorityLevel: PriorityLevel;
  explanation: string;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  createdAt: string; // Original arrival time - NEVER RESET!
  updatedAt: string;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  completedAt?: string | null;
  priorityInfo?: PriorityBreakdown;
}

export interface CartItem {
  item: {
    itemId: string;
    itemName: string;
    price: number;
    categoryName: string;
  };
  quantity: number;
  notes?: string;
}
