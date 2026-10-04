import type { Order } from '../types/order';

export interface DailyReportSummary {
  totalSales: number;
  totalOrders: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;
  averageOrderValue: number;
  averageWaitTimeMinutes: number;
  totalItemsSold: number;
  topSellingItems: Array<{ itemName: string; quantity: number; revenue: number }>;
  categorySales: Array<{ categoryName: string; quantity: number; revenue: number }>;
  hourlyVolume: Array<{ hourLabel: string; orderCount: number; revenue: number }>;
}

export function generateReportSummary(
  orders: Order[],
  timeFilter: 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'ALL' = 'ALL'
): DailyReportSummary {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let filtered = orders;

  if (timeFilter === 'TODAY') {
    filtered = orders.filter((o) => new Date(o.createdAt).getTime() >= startOfDay);
  } else if (timeFilter === 'YESTERDAY') {
    const startOfYesterday = startOfDay - 24 * 60 * 60 * 1000;
    filtered = orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= startOfYesterday && t < startOfDay;
    });
  } else if (timeFilter === 'WEEK') {
    const startOfWeek = startOfDay - 7 * 24 * 60 * 60 * 1000;
    filtered = orders.filter((o) => new Date(o.createdAt).getTime() >= startOfWeek);
  } else if (timeFilter === 'MONTH') {
    const startOfMonth = startOfDay - 30 * 24 * 60 * 60 * 1000;
    filtered = orders.filter((o) => new Date(o.createdAt).getTime() >= startOfMonth);
  }

  const validOrders = filtered.filter((o) => o.status !== 'CANCELLED');
  const completedOrders = filtered.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'READY' || o.status === 'DELIVERED'
  );
  const cancelledOrders = filtered.filter((o) => o.status === 'CANCELLED');

  const totalSales = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrders = filtered.length;
  const averageOrderValue = validOrders.length > 0 ? Math.round(totalSales / validOrders.length) : 0;

  let totalWaitMs = 0;
  let waitCount = 0;
  completedOrders.forEach((o) => {
    if (o.completedAt && o.createdAt) {
      const wait = new Date(o.completedAt).getTime() - new Date(o.createdAt).getTime();
      if (wait > 0) {
        totalWaitMs += wait;
        waitCount++;
      }
    }
  });
  const averageWaitTimeMinutes = waitCount > 0 ? Math.round((totalWaitMs / (waitCount * 60000)) * 10) / 10 : 0;

  const itemMap = new Map<string, { itemName: string; quantity: number; revenue: number }>();
  const catMap = new Map<string, { categoryName: string; quantity: number; revenue: number }>();

  let totalItemsSold = 0;

  validOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      totalItemsSold += item.quantity;
      const rev = item.quantity * item.unitPrice;

      const existingItem = itemMap.get(item.itemName) || { itemName: item.itemName, quantity: 0, revenue: 0 };
      existingItem.quantity += item.quantity;
      existingItem.revenue += rev;
      itemMap.set(item.itemName, existingItem);

      const catKey = 'Menu Item';
      const existingCat = catMap.get(catKey) || { categoryName: catKey, quantity: 0, revenue: 0 };
      existingCat.quantity += item.quantity;
      existingCat.revenue += rev;
      catMap.set(catKey, existingCat);
    });
  });

  const topSellingItems = Array.from(itemMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const categorySales = Array.from(catMap.values())
    .sort((a, b) => b.revenue - a.revenue);

  const hourlyBuckets = Array.from({ length: 24 }, (_, hour) => ({
    hourLabel: `${String(hour).padStart(2, '0')}:00`,
    orderCount: 0,
    revenue: 0,
  }));

  validOrders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    if (hour >= 0 && hour < 24) {
      hourlyBuckets[hour].orderCount += 1;
      hourlyBuckets[hour].revenue += o.grandTotal;
    }
  });

  return {
    totalSales,
    totalOrders,
    completedOrdersCount: completedOrders.length,
    cancelledOrdersCount: cancelledOrders.length,
    averageOrderValue,
    averageWaitTimeMinutes,
    totalItemsSold,
    topSellingItems,
    categorySales,
    hourlyVolume: hourlyBuckets,
  };
}
