import type { Order, PriorityBreakdown, PriorityLevel } from '../types/order';
import type { AppSettings } from '../types/settings';

/**
 * Calculates priority breakdown for a single order at a given reference timestamp.
 */
export function calculateOrderPriority(
  order: Order,
  settings: AppSettings,
  nowTimestamp: number = Date.now()
): PriorityBreakdown {
  const createdTimestamp = new Date(order.createdAt).getTime();
  const elapsedMs = Math.max(0, nowTimestamp - createdTimestamp);
  const waitMinutes = elapsedMs / (1000 * 60);

  let totalItems = 0;
  let completedItems = 0;

  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      totalItems += item.quantity;
      completedItems += item.completedQuantity;
    }
  }

  const remainingItems = Math.max(0, totalItems - completedItems);
  const completionRatio = totalItems > 0 ? completedItems / totalItems : 0;

  // Aging Score calculation: min(waitMinutes / 5, 100) * agingWeight
  const baseAging = Math.min((waitMinutes / 5) * 10, 100);
  const agingScore = baseAging * settings.priorityAgingWeight;

  // Workload Score calculation: min(remainingItems * weight, maxWorkloadScore)
  const workloadScore = Math.min(
    remainingItems * settings.priorityWorkloadWeight,
    settings.maxWorkloadScore
  );

  // Completion Bonus / Adjustment
  const completionBonus = completionRatio * settings.priorityCompletionWeight;

  // Anti-Starvation Boost
  let starvationBoost = 0;
  if (waitMinutes > settings.starvationThresholdMinutes) {
    const extraMins = waitMinutes - settings.starvationThresholdMinutes;
    starvationBoost = extraMins * settings.starvationBoostPerMin;
  }

  // Final Priority Score calculation
  const rawScore = agingScore + workloadScore - completionBonus + starvationBoost;
  const priorityScore = Math.round(Math.max(0, rawScore) * 10) / 10;

  // Priority Level Classification
  let priorityLevel: PriorityLevel = 'NORMAL';
  if (priorityScore >= 75 || waitMinutes >= 25) {
    priorityLevel = 'CRITICAL';
  } else if (priorityScore >= 50 || waitMinutes >= 15) {
    priorityLevel = 'HIGH';
  } else if (priorityScore >= 30 || waitMinutes >= 8) {
    priorityLevel = 'MEDIUM';
  }

  const formattedWait = `${Math.floor(waitMinutes)}m ${Math.floor((elapsedMs / 1000) % 60)}s`;

  const explanation = `Priority calculated based on:\n` +
    `• Waiting Time: ${formattedWait} (+${agingScore.toFixed(1)} aging pts)\n` +
    `• Workload: ${remainingItems} remaining items (+${workloadScore.toFixed(1)} workload pts)\n` +
    `• Progress: ${completedItems}/${totalItems} completed (-${completionBonus.toFixed(1)} ratio adjustment)\n` +
    (starvationBoost > 0 ? `• Anti-Starvation Boost: +${starvationBoost.toFixed(1)} pts for waiting over ${settings.starvationThresholdMinutes} mins\n` : '') +
    `Total Priority Score: ${priorityScore}`;

  return {
    priorityRank: 0,
    priorityScore,
    agingScore: Math.round(agingScore * 10) / 10,
    workloadScore: Math.round(workloadScore * 10) / 10,
    completionBonus: Math.round(completionBonus * 10) / 10,
    starvationBoost: Math.round(starvationBoost * 10) / 10,
    remainingItems,
    completedItems,
    totalItems,
    waitMinutes: Math.round(waitMinutes * 10) / 10,
    priorityLevel,
    explanation,
  };
}

/**
 * Ranks all orders dynamically by Priority Score (descending) for active orders.
 */
export function rankOrders(
  orders: Order[],
  settings: AppSettings,
  nowTimestamp: number = Date.now()
): Order[] {
  const activeStatuses = new Set(['PENDING', 'IN_PROGRESS']);

  const activeOrders: Order[] = [];
  const inactiveOrders: Order[] = [];

  orders.forEach((order) => {
    if (activeStatuses.has(order.status)) {
      activeOrders.push(order);
    } else {
      inactiveOrders.push(order);
    }
  });

  const activeWithScore = activeOrders.map((order) => ({
    order,
    priorityInfo: calculateOrderPriority(order, settings, nowTimestamp),
  }));

  activeWithScore.sort((a, b) => {
    if (b.priorityInfo.priorityScore !== a.priorityInfo.priorityScore) {
      return b.priorityInfo.priorityScore - a.priorityInfo.priorityScore;
    }
    return new Date(a.order.createdAt).getTime() - new Date(b.order.createdAt).getTime();
  });

  const sortedActiveOrders: Order[] = activeWithScore.map((item, index) => ({
    ...item.order,
    priorityInfo: {
      ...item.priorityInfo,
      priorityRank: index + 1,
    },
  }));

  const processedInactiveOrders: Order[] = inactiveOrders.map((order) => {
    const priorityInfo = calculateOrderPriority(order, settings, nowTimestamp);
    return {
      ...order,
      priorityInfo: {
        ...priorityInfo,
        priorityRank: 0,
      },
    };
  });

  return [...sortedActiveOrders, ...processedInactiveOrders];
}
