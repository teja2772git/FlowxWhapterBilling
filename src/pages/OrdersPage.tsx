import React, { useState } from 'react';
import { Flame, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KdsDashboardHeader } from '../components/orders/KdsDashboardHeader';
import { OrderFilters } from '../components/orders/OrderFilters';
import { OrderCard } from '../components/orders/OrderCard';
import { PriorityExplanationModal } from '../components/orders/PriorityExplanationModal';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import type { Order } from '../types/order';

export const OrdersPage: React.FC = () => {
  const { orders } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortMode, setSortMode] = useState<'SMART_PRIORITY' | 'OLDEST_FIRST'>('SMART_PRIORITY');

  const [selectedExplainOrder, setSelectedExplainOrder] = useState<Order | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  let filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') {
      if (o.status !== 'PENDING' && o.status !== 'IN_PROGRESS') return false;
    } else if (statusFilter !== 'ALL') {
      if (o.status !== statusFilter) return false;
    }

    if (priorityFilter !== 'ALL') {
      if (o.priorityInfo?.priorityLevel !== priorityFilter) return false;
    }

    return true;
  });

  if (sortMode === 'OLDEST_FIRST') {
    filteredOrders = [...filteredOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      <KdsDashboardHeader />

      <OrderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Flame className="w-6 h-6 text-[#ffd400]" />
            <h2 className="text-2xl font-black text-white uppercase font-display tracking-wide">
              {statusFilter === 'ACTIVE' ? 'KITCHEN PRIORITY QUEUE' : `${statusFilter} ORDERS`}
            </h2>
            <span className="bg-[#ffd400] text-[#00247d] text-xs font-black px-3 py-1 rounded-full shadow-md border border-white font-display">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'ORDER' : 'ORDERS'}
            </span>
          </div>

          {sortMode === 'SMART_PRIORITY' && (
            <div className="text-xs text-[#ffd400] flex items-center space-x-1.5 font-bold bg-[#00247d] px-3 py-1.5 rounded-xl border border-[#ffd400]/40">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>SMART PRIORITY ENGINE ACTIVE</span>
            </div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-[#00247d] border-2 border-[#ffd400]/40 rounded-3xl p-12 text-center text-white my-4 shadow-xl">
            <CheckCircle className="w-14 h-14 stroke-1 text-[#ffd400] mx-auto mb-3" />
            <h3 className="font-display text-2xl text-[#ffd400] uppercase">NO ORDERS MATCH FILTER</h3>
            <p className="text-xs text-white/80 font-bold mt-1">
              Select a different status filter or place a new order from the Billing screen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onOpenDetails={(o) => setSelectedDetailOrder(o)}
                onExplainPriority={(o) => setSelectedExplainOrder(o)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedExplainOrder && (
        <PriorityExplanationModal
          order={selectedExplainOrder}
          onClose={() => setSelectedExplainOrder(null)}
        />
      )}

      {selectedDetailOrder && (
        <OrderDetailModal
          order={selectedDetailOrder}
          onClose={() => setSelectedDetailOrder(null)}
        />
      )}
    </div>
  );
};
