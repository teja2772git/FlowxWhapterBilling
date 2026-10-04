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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* Active Orders Card */}
      <div className="bg-white border-2 border-red-200 p-4 rounded-2xl flex items-center space-x-3.5 shadow-lg">
        <div className="bg-red-500 text-white p-3 rounded-2xl shadow-sm">
          <Flame className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-red-600 uppercase tracking-wider">
            ACTIVE ORDERS
          </div>
          <div className="text-3xl font-black text-slate-900">{activeOrders.length}</div>
        </div>
      </div>

      {/* Completed Today Card */}
      <div className="bg-white border-2 border-emerald-200 p-4 rounded-2xl flex items-center space-x-3.5 shadow-lg">
        <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-sm">
          <CheckCircle className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
            COMPLETED TODAY
          </div>
          <div className="text-3xl font-black text-slate-900">
            {report.completedOrdersCount}
          </div>
        </div>
      </div>

      {/* Total Items Pending Card */}
      <div className="bg-white border-2 border-sky-200 p-4 rounded-2xl flex items-center space-x-3.5 shadow-md">
        <div className="bg-[#0089e8] text-white p-3 rounded-2xl font-black shadow-sm">
          <PackageCheck className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-[#0089e8] uppercase tracking-wider">
            PENDING ITEMS
          </div>
          <div className="text-3xl font-black text-slate-900">{itemsPending}</div>
        </div>
      </div>

      {/* Avg Wait Time Card */}
      <div className="bg-white border-2 border-purple-200 p-4 rounded-2xl flex items-center space-x-3.5 shadow-md">
        <div className="bg-purple-600 text-white p-3 rounded-2xl shadow-sm">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-extrabold text-purple-700 uppercase tracking-wider">
            AVG WAIT TIME
          </div>
          <div className="text-3xl font-black text-slate-900">
            {report.averageWaitTimeMinutes}m
          </div>
        </div>
      </div>

      {/* Current Top Priority Card */}
      <div className="bg-white border-4 border-[#ffd400] p-4 rounded-2xl flex items-center space-x-3.5 shadow-lg col-span-2 sm:col-span-1">
        <div className="bg-[#ffd400] text-[#00569e] p-3 rounded-2xl font-black shadow-sm">
          <Award className="w-6 h-6" />
        </div>
        <div className="truncate">
          <div className="text-xs font-extrabold text-[#0089e8] uppercase tracking-wider">
            TOP PRIORITY #1
          </div>
          <div className="text-2xl font-black text-slate-900 truncate">
            {topPriorityOrder ? topPriorityOrder.orderNumber : 'QUEUE CLEAR'}
          </div>
        </div>
      </div>
    </div>
  );
};
