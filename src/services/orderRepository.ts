import type { Order, OrderItem, OrderStatus } from '../types/order';

export class OrderRepository {
  private orders: Order[];
  private onDataChanged: () => void;

  constructor(initialOrders: Order[], onDataChanged: () => void) {
    this.orders = initialOrders;
    this.onDataChanged = onDataChanged;
  }

  public updateData(orders: Order[]) {
    this.orders = orders;
  }

  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getActiveOrders(): Order[] {
    return this.orders.filter(
      (o) => o.status === 'PENDING' || o.status === 'IN_PROGRESS'
    );
  }

  public getCompletedOrders(): Order[] {
    return this.orders.filter(
      (o) => o.status === 'COMPLETED' || o.status === 'READY' || o.status === 'DELIVERED'
    );
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.orderId === orderId);
  }

  public createOrder(
    orderInput: Omit<Order, 'orderId' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status' | 'completedAt' | 'items'> & {
      items: Array<{ itemId: string; itemName: string; unitPrice: number; quantity: number; notes?: string }>;
    }
  ): Order {
    const now = new Date().toISOString();
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const dailyCount = this.orders.filter((o) => o.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length + 1;
    const orderNumberStr = String(dailyCount).padStart(3, '0');
    const orderId = `FL-${dateCode}-${orderNumberStr}`;

    const formattedItems: OrderItem[] = orderInput.items.map((item, idx) => ({
      orderItemId: `${orderId}-item-${idx + 1}`,
      orderId: orderId,
      itemId: item.itemId,
      itemName: item.itemName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      completedQuantity: 0,
      remainingQuantity: item.quantity,
      notes: item.notes,
      createdAt: now,
      updatedAt: now,
    }));

    const newOrder: Order = {
      orderId,
      orderNumber: `#FL-${orderNumberStr}`,
      createdAt: now, // ORIGINAL ARRIVAL TIME - NEVER RESET!
      updatedAt: now,
      status: 'PENDING',
      customerName: orderInput.customerName || 'Walk-in Customer',
      customerPhone: orderInput.customerPhone || '',
      items: formattedItems,
      subtotal: orderInput.subtotal,
      discount: orderInput.discount,
      tax: orderInput.tax,
      grandTotal: orderInput.grandTotal,
      completedAt: null,
    };

    this.orders.unshift(newOrder);
    this.onDataChanged();
    return newOrder;
  }

  public completeOrderItemUnit(orderId: string, orderItemId: string, delta = 1): Order {
    const idx = this.orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new Error(`Order ${orderId} not found`);

    const order = this.orders[idx];
    const itemIdx = order.items.findIndex((i) => i.orderItemId === orderItemId);
    if (itemIdx === -1) throw new Error(`Order item ${orderItemId} not found`);

    const now = new Date().toISOString();
    const targetItem = order.items[itemIdx];
    const newCompleted = Math.min(
      targetItem.quantity,
      Math.max(0, targetItem.completedQuantity + delta)
    );
    const newRemaining = Math.max(0, targetItem.quantity - newCompleted);

    const updatedItem: OrderItem = {
      ...targetItem,
      completedQuantity: newCompleted,
      remainingQuantity: newRemaining,
      updatedAt: now,
    };

    const updatedItems = [...order.items];
    updatedItems[itemIdx] = updatedItem;

    const allItemsCompleted = updatedItems.every((i) => i.remainingQuantity === 0);
    const someItemsStarted = updatedItems.some((i) => i.completedQuantity > 0);

    let newStatus: OrderStatus = order.status;
    let completedAt = order.completedAt;

    if (allItemsCompleted) {
      newStatus = 'READY';
      completedAt = now;
    } else if (someItemsStarted && order.status === 'PENDING') {
      newStatus = 'IN_PROGRESS';
    }

    const updatedOrder: Order = {
      ...order,
      items: updatedItems,
      status: newStatus,
      completedAt,
      updatedAt: now,
    };

    this.orders[idx] = updatedOrder;
    this.onDataChanged();
    return updatedOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus): Order {
    const idx = this.orders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) throw new Error(`Order ${orderId} not found`);

    const now = new Date().toISOString();
    const updatedOrder: Order = {
      ...this.orders[idx],
      status,
      completedAt: status === 'COMPLETED' || status === 'DELIVERED' || status === 'READY'
        ? (this.orders[idx].completedAt || now)
        : this.orders[idx].completedAt,
      updatedAt: now,
    };

    this.orders[idx] = updatedOrder;
    this.onDataChanged();
    return updatedOrder;
  }

  public cancelOrder(orderId: string): Order {
    return this.updateOrderStatus(orderId, 'CANCELLED');
  }

  public markDelivered(orderId: string): Order {
    return this.updateOrderStatus(orderId, 'DELIVERED');
  }

  public markCompleted(orderId: string): Order {
    return this.updateOrderStatus(orderId, 'COMPLETED');
  }
}
