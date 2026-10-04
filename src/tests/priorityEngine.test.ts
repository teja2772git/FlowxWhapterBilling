import { describe, it, expect } from 'vitest';
import { calculateOrderPriority, rankOrders } from '../services/priorityEngine';
import type { Order } from '../types/order';
import { INITIAL_SETTINGS } from '../data/initialSettings';

const baseTime = new Date('2026-10-04T12:00:00.000Z').getTime();

function createMockOrder(
  id: string,
  minsAgo: number,
  itemsSpec: { qty: number; completed: number }[],
  status: Order['status'] = 'PENDING'
): Order {
  const createdAt = new Date(baseTime - minsAgo * 60 * 1000).toISOString();
  return {
    orderId: id,
    orderNumber: `FL-${id}`,
    createdAt,
    updatedAt: createdAt,
    status,
    customerName: 'Test Customer',
    items: itemsSpec.map((item, idx) => ({
      orderItemId: `${id}-item-${idx}`,
      orderId: id,
      itemId: `item-${idx}`,
      itemName: `Test Item ${idx + 1}`,
      unitPrice: 100,
      quantity: item.qty,
      completedQuantity: item.completed,
      remainingQuantity: item.qty - item.completed,
      createdAt,
      updatedAt: createdAt,
    })),
    subtotal: 100,
    discount: 0,
    tax: 0,
    grandTotal: 100,
  };
}

describe('Priority Engine Unit Tests', () => {
  it('1. Old small order vs new large order - anti-starvation allows old small order to rise', () => {
    const oldSmall = createMockOrder('old-small', 20, [{ qty: 1, completed: 0 }]);
    const newLarge = createMockOrder('new-large', 2, [{ qty: 15, completed: 0 }]);

    const ranked = rankOrders([oldSmall, newLarge], INITIAL_SETTINGS, baseTime);

    const oldSmallRanked = ranked.find((o) => o.orderId === 'old-small');
    const newLargeRanked = ranked.find((o) => o.orderId === 'new-large');

    expect(oldSmallRanked?.priorityInfo?.priorityRank).toBe(1);
    expect(newLargeRanked?.priorityInfo?.priorityRank).toBe(2);
  });

  it('2. Old large order vs new small order', () => {
    const oldLarge = createMockOrder('old-large', 15, [{ qty: 10, completed: 0 }]);
    const newSmall = createMockOrder('new-small', 1, [{ qty: 1, completed: 0 }]);

    const ranked = rankOrders([oldLarge, newSmall], INITIAL_SETTINGS, baseTime);

    expect(ranked[0].orderId).toBe('old-large');
    expect(ranked[0].priorityInfo?.priorityRank).toBe(1);
    expect(ranked[1].orderId).toBe('new-small');
  });

  it('3. Partially completed order - score updates as items are completed', () => {
    const orderBefore = createMockOrder('partial', 10, [{ qty: 10, completed: 0 }]);
    const orderAfter = createMockOrder('partial', 10, [{ qty: 10, completed: 6 }]);

    const scoreBefore = calculateOrderPriority(orderBefore, INITIAL_SETTINGS, baseTime);
    const scoreAfter = calculateOrderPriority(orderAfter, INITIAL_SETTINGS, baseTime);

    expect(scoreAfter.remainingItems).toBe(4);
    expect(scoreAfter.completedItems).toBe(6);
    expect(scoreAfter.workloadScore).toBeLessThan(scoreBefore.workloadScore);
    expect(scoreAfter.priorityScore).toBeLessThan(scoreBefore.priorityScore);
  });

  it('4. Fully completed order - zero remaining items', () => {
    const completedOrder = createMockOrder('completed', 5, [{ qty: 3, completed: 3 }], 'COMPLETED');
    const priorityInfo = calculateOrderPriority(completedOrder, INITIAL_SETTINGS, baseTime);

    expect(priorityInfo.remainingItems).toBe(0);
    expect(priorityInfo.completedItems).toBe(3);
  });

  it('5. Multiple orders arriving at exact same time with different workloads', () => {
    const orderA = createMockOrder('same-a', 5, [{ qty: 2, completed: 0 }]);
    const orderB = createMockOrder('same-b', 5, [{ qty: 8, completed: 0 }]);

    const ranked = rankOrders([orderA, orderB], INITIAL_SETTINGS, baseTime);
    expect(ranked[0].orderId).toBe('same-b');
  });

  it('6. Anti-starvation boost activates after starvationThresholdMinutes', () => {
    const normalOrder = createMockOrder('normal', 10, [{ qty: 2, completed: 0 }]);
    const starvingOrder = createMockOrder('starving', 25, [{ qty: 2, completed: 0 }]);

    const normalScore = calculateOrderPriority(normalOrder, INITIAL_SETTINGS, baseTime);
    const starvingScore = calculateOrderPriority(starvingOrder, INITIAL_SETTINGS, baseTime);

    expect(normalScore.starvationBoost).toBe(0);
    expect(starvingScore.starvationBoost).toBeGreaterThan(0);
  });

  it('7. Zero remaining items calculation', () => {
    const zeroOrder = createMockOrder('zero', 10, [{ qty: 5, completed: 5 }]);
    const score = calculateOrderPriority(zeroOrder, INITIAL_SETTINGS, baseTime);
    expect(score.remainingItems).toBe(0);
    expect(score.workloadScore).toBe(0);
  });

  it('8. Cancelled order - priority rank set to 0', () => {
    const cancelled = createMockOrder('cancelled', 10, [{ qty: 2, completed: 0 }], 'CANCELLED');
    const active = createMockOrder('active', 5, [{ qty: 2, completed: 0 }], 'PENDING');

    const ranked = rankOrders([cancelled, active], INITIAL_SETTINGS, baseTime);
    const cancelledRanked = ranked.find((o) => o.orderId === 'cancelled');

    expect(cancelledRanked?.priorityInfo?.priorityRank).toBe(0);
  });

  it('9. Ready order - excluded from active rank 1-N queue', () => {
    const ready = createMockOrder('ready', 10, [{ qty: 2, completed: 2 }], 'READY');
    const active = createMockOrder('active', 5, [{ qty: 2, completed: 0 }], 'PENDING');

    const ranked = rankOrders([ready, active], INITIAL_SETTINGS, baseTime);
    const readyRanked = ranked.find((o) => o.orderId === 'ready');
    const activeRanked = ranked.find((o) => o.orderId === 'active');

    expect(readyRanked?.priorityInfo?.priorityRank).toBe(0);
    expect(activeRanked?.priorityInfo?.priorityRank).toBe(1);
  });

  it('10. Sudden crowd scenario - balances age, workload, and anti-starvation', () => {
    const orderA = createMockOrder('crowd-A', 20, [{ qty: 2, completed: 0 }]);
    const orderB = createMockOrder('crowd-B', 19, [{ qty: 15, completed: 0 }]);
    const orderC = createMockOrder('crowd-C', 18, [{ qty: 3, completed: 0 }]);
    const orderD = createMockOrder('crowd-D', 17, [{ qty: 20, completed: 0 }]);

    const ranked = rankOrders([orderA, orderB, orderC, orderD], INITIAL_SETTINGS, baseTime);

    expect(ranked.length).toBe(4);
    ranked.forEach((o, index) => {
      expect(o.priorityInfo?.priorityRank).toBe(index + 1);
    });
  });

  it('11. Same remaining items with different arrival times', () => {
    const older = createMockOrder('older', 15, [{ qty: 5, completed: 0 }]);
    const newer = createMockOrder('newer', 2, [{ qty: 5, completed: 0 }]);

    const ranked = rankOrders([older, newer], INITIAL_SETTINGS, baseTime);
    expect(ranked[0].orderId).toBe('older');
    expect(ranked[0].priorityInfo?.priorityRank).toBe(1);
  });

  it('12. Same arrival time with different remaining items', () => {
    const smaller = createMockOrder('smaller', 10, [{ qty: 2, completed: 0 }]);
    const larger = createMockOrder('larger', 10, [{ qty: 8, completed: 0 }]);

    const ranked = rankOrders([smaller, larger], INITIAL_SETTINGS, baseTime);
    expect(ranked[0].orderId).toBe('larger');
    expect(ranked[0].priorityInfo?.priorityRank).toBe(1);
  });
});
