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
    <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-5 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* Clean Page Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          Manage your kitchen queue and track order progress.
        </p>
      </div>

      {/* Stats Cards Row */}
      <KdsDashboardHeader />

      {/* Filter & Toolbar Row */}
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

      {/* Kitchen Queue Container */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-bold text-slate-900">
              {statusFilter === 'ACTIVE' ? 'Kitchen Queue' : `${statusFilter.replace('_', ' ')} Orders`}
            </h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </span>
          </div>

          {sortMode === 'SMART_PRIORITY' && (
            <div className="text-xs text-sky-700 font-medium bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Smart Priority Active</span>
            </div>
          )}
        </div>

        {/* Orders List / Clean Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-saas my-2">
            <CheckCircle className="w-10 h-10 text-sky-500 mx-auto mb-2 stroke-[1.5]" />
            <h3 className="text-base font-semibold text-slate-800">No orders match filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Select a different status filter or place a new order from the Billing screen.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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

      {/* Modals */}
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
