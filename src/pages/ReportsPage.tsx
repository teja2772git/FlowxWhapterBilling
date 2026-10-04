import React, { useState } from 'react';
import {
  BarChart3,
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
    <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-7 h-7 text-[#ffd400]" />
            <h1 className="text-3xl font-black text-white uppercase font-display tracking-wide">
              SALES & ANALYTICS REPORTS
            </h1>
          </div>
          <p className="text-xs text-white/90 font-bold uppercase tracking-wider mt-0.5">
            Real-time performance analytics calculated directly from your Excel order history.
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#00247d] border-2 border-[#ffd400]/60 p-1.5 rounded-2xl text-xs">
          <Calendar className="w-4 h-4 text-[#ffd400] ml-2 mr-1" />
          {(['TODAY', 'YESTERDAY', 'WEEK', 'MONTH', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider transition-colors ${
                timeFilter === tf
                  ? 'bg-[#ffd400] text-[#00247d] border border-white font-display shadow-md'
                  : 'text-white/80 hover:text-[#ffd400]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-[#ffd400] mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-white/80">TOTAL SALES</span>
          </div>
          <div className="text-2xl font-black text-[#ffd400] font-display">
            {formatCurrency(report.totalSales, settings.currencySymbol)}
          </div>
        </div>

        <div className="bg-[#00247d] border-2 border-[#ffd400]/40 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-blue-300 mb-1">
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-white/80">ORDERS</span>
          </div>
          <div className="text-2xl font-black text-white font-display">{report.totalOrders}</div>
        </div>

        <div className="bg-[#00247d] border-2 border-[#ffd400]/40 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <CheckCircle className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-white/80">COMPLETED</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-display">{report.completedOrdersCount}</div>
        </div>

        <div className="bg-[#00247d] border-2 border-[#ffd400]/40 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-[#ffd400] mb-1">
            <DollarSign className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-white/80">AVG ORDER</span>
          </div>
          <div className="text-2xl font-black text-[#ffd400] font-display">
            {formatCurrency(report.averageOrderValue, settings.currencySymbol)}
          </div>
        </div>

        <div className="bg-[#00247d] border-2 border-[#ffd400]/40 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-purple-300 mb-1">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-white/80">AVG WAIT</span>
          </div>
          <div className="text-2xl font-black text-purple-300 font-display">
            {report.averageWaitTimeMinutes}m
          </div>
        </div>

        <div className="bg-[#00247d] border-2 border-[#ffd400]/40 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-orange-300 mb-1">
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase text-white/80">ITEMS SOLD</span>
          </div>
          <div className="text-2xl font-black text-orange-300 font-display">{report.totalItemsSold}</div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-5 rounded-3xl shadow-2xl space-y-3">
          <h3 className="font-display text-lg text-[#ffd400] uppercase tracking-wide flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#ffd400]" />
            <span>HOURLY ORDER VOLUME</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.hourlyVolume}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd400" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ffd400" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#001b63" />
                <XAxis dataKey="hourLabel" stroke="#ffffff" fontSize={10} />
                <YAxis stroke="#ffffff" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#001b63', borderColor: '#ffd400', borderRadius: '12px', color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ffd400" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-5 rounded-3xl shadow-2xl space-y-3">
          <h3 className="font-display text-lg text-[#ffd400] uppercase tracking-wide flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>TOP 5 BEST SELLING ITEMS (QUANTITY)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.topSellingItems.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#001b63" />
                <XAxis type="number" stroke="#ffffff" fontSize={10} />
                <YAxis dataKey="itemName" type="category" stroke="#ffffff" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#001b63', borderColor: '#ffd400', borderRadius: '12px', color: '#ffffff' }}
                />
                <Bar dataKey="quantity" fill="#ffd400" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-[#00247d] border-2 border-[#ffd400]/60 rounded-3xl p-5 shadow-2xl space-y-3">
        <h3 className="font-display text-lg text-[#ffd400] uppercase tracking-wide">
          ITEM PERFORMANCE BREAKDOWN
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#001b63] text-[#ffd400] font-black uppercase border-b-2 border-[#ffd400]/40 font-display text-sm">
                <th className="p-3.5">ITEM NAME</th>
                <th className="p-3.5 text-center">UNITS SOLD</th>
                <th className="p-3.5 text-right">TOTAL REVENUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffd400]/20 text-white font-bold">
              {report.topSellingItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-white/70 font-display text-base">
                    NO SALES RECORDED IN SELECTED TIME FRAME.
                  </td>
                </tr>
              ) : (
                report.topSellingItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#0038a8]/60">
                    <td className="p-3.5 font-extrabold text-white uppercase">{item.itemName}</td>
                    <td className="p-3.5 text-center font-black text-[#ffd400] font-display text-base">{item.quantity}</td>
                    <td className="p-3.5 text-right font-black text-emerald-400 font-display text-base">
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
