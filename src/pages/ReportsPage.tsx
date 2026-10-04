import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  Package,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { generateReportSummary } from '../services/reportService';
import { formatCurrency } from '../utils/formatting';

export const ReportsPage: React.FC = () => {
  const { orders, settings } = useApp();

  const [timeFilter, setTimeFilter] = useState<'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');

  const report = generateReportSummary(orders, timeFilter);

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6 space-y-5 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      {/* Clean Page Title Header & Time Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Sales & Analytics Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Real-time performance analytics calculated directly from your order history.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-xl text-xs shadow-saas overflow-x-auto">
          <Calendar className="w-3.5 h-3.5 text-sky-500 ml-2 mr-1 shrink-0" />
          {(['TODAY', 'YESTERDAY', 'WEEK', 'MONTH', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3 py-1 rounded-lg font-semibold text-xs whitespace-nowrap transition-all shrink-0 ${
                timeFilter === tf
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-saas">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Sales</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(report.totalSales, settings.currencySymbol)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-saas">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Orders</span>
            <ShoppingCart className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{report.totalOrders}</div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-saas">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{report.completedOrdersCount}</div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-saas">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Avg Order</span>
            <DollarSign className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {formatCurrency(report.averageOrderValue, settings.currencySymbol)}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-saas">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Avg Wait</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {report.averageWaitTimeMinutes}m
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-saas">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium text-slate-500">Items Sold</span>
            <Package className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{report.totalItemsSold}</div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-saas space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-500" />
            <span>Hourly Order Volume</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.hourlyVolume}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hourLabel" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-xl shadow-saas space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <span>Top 5 Best Selling Items (Quantity)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.topSellingItems.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="itemName" type="category" stroke="#64748B" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '12px' }}
                />
                <Bar dataKey="quantity" fill="#0EA5E9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-saas space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Item Performance Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="p-3">Item Name</th>
                <th className="p-3 text-center">Units Sold</th>
                <th className="p-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {report.topSellingItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400 font-normal">
                    No sales recorded in selected time frame.
                  </td>
                </tr>
              ) : (
                report.topSellingItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{item.itemName}</td>
                    <td className="p-3 text-center font-semibold text-slate-700">{item.quantity}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.revenue, settings.currencySymbol)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
