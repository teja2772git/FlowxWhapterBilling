import React from 'react';
import { Flame, CheckCircle, Clock, Award, PackageCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateReportSummary } from '../../services/reportService';

export const KdsDashboardHeader: React.FC = () => {
  const { orders } = useApp();

  const activeOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'IN_PROGRESS'
  );

  const report = generateReportSummary(orders, 'TODAY');

  let itemsPending = 0;
  activeOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      itemsPending += item.remainingQuantity;
    });
  });

  const topPriorityOrder = activeOrders.length > 0 ? activeOrders[0] : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* Active Orders Card */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center space-x-3 shadow-saas hover:border-sky-300 transition-all">
        <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg shrink-0">
          <Flame className="w-5 h-5 text-sky-500" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500 truncate">
            Active Orders
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight">
            {activeOrders.length}
          </div>
        </div>
      </div>

      {/* Completed Today Card */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center space-x-3 shadow-saas hover:border-sky-300 transition-all">
        <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg shrink-0">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500 truncate">
            Completed Today
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight">
            {report.completedOrdersCount}
          </div>
        </div>
      </div>

      {/* Total Items Pending Card */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center space-x-3 shadow-saas hover:border-sky-300 transition-all">
        <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg shrink-0">
          <PackageCheck className="w-5 h-5 text-sky-500" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500 truncate">
            Pending Items
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight">
            {itemsPending}
          </div>
        </div>
      </div>

      {/* Avg Wait Time Card */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center space-x-3 shadow-saas hover:border-sky-300 transition-all">
        <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg shrink-0">
          <Clock className="w-5 h-5 text-sky-500" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500 truncate">
            Avg Wait Time
          </div>
          <div className="text-2xl font-bold text-slate-900 leading-tight">
            {report.averageWaitTimeMinutes}m
          </div>
        </div>
      </div>

      {/* Current Top Priority Card */}
      <div className="bg-white border border-sky-300 bg-sky-50/30 p-3.5 rounded-xl flex items-center space-x-3 shadow-saas col-span-2 sm:col-span-1">
        <div className="bg-sky-500 text-white p-2.5 rounded-lg shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div className="min-w-0 truncate">
          <div className="text-xs font-medium text-sky-700 truncate">
            Top Priority #1
          </div>
          <div className="text-xl font-bold text-slate-900 truncate">
            {topPriorityOrder ? topPriorityOrder.orderNumber : 'Clear'}
          </div>
        </div>
      </div>
    </div>
  );
};
