import React from 'react';
import { Clock, Check, HelpCircle, Eye } from 'lucide-react';
import type { Order } from '../../types/order';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatTime, formatElapsedTime } from '../../utils/formatting';

interface OrderCardProps {
  order: Order;
  onOpenDetails: (order: Order) => void;
  onExplainPriority: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onOpenDetails,
  onExplainPriority,
}) => {
  const { completeOrderItemUnit, settings, nowTick } = useApp();

  const p = order.priorityInfo;

  let totalItems = 0;
  let completedItems = 0;
  (order.items || []).forEach((item) => {
    totalItems += item.quantity;
    completedItems += item.completedQuantity;
  });
  const remainingItems = Math.max(0, totalItems - completedItems);
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const liveWait = formatElapsedTime(order.createdAt, nowTick);

  const level = p?.priorityLevel || 'NORMAL';
  const rank = p?.priorityRank || 0;

  // Priority Visual Hierarchy (Section 15 & 16 Requirement)
  const priorityBadgeStyle =
    level === 'CRITICAL'
      ? 'bg-red-600 text-white border-white shadow-red-500/40'
      : level === 'HIGH'
      ? 'bg-orange-500 text-white border-white shadow-orange-500/30'
      : level === 'MEDIUM'
      ? 'bg-[#ffd400] text-[#00247d] border-white shadow-[#ffd400]/30'
      : 'bg-emerald-600 text-white border-white shadow-emerald-500/20';

  const cardBorderStyle =
    rank === 1
      ? 'border-4 border-[#ffd400] bg-white shadow-xl scale-[1.01]'
      : level === 'CRITICAL'
      ? 'border-4 border-red-500 bg-white shadow-lg'
      : 'border-2 border-[#0089e8]/20 bg-white hover:border-[#0089e8] shadow-md';

  return (
    <div className={`rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all ${cardBorderStyle}`}>
      {/* Top Row: HUGE Priority Number & Order Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-100 pb-3 gap-3">
        <div className="flex items-center space-x-3">
          {/* HUGE Priority Badge */}
          {rank > 0 && (
            <div className={`text-2xl font-black px-3.5 py-1 rounded-2xl border-2 shadow-sm shrink-0 ${priorityBadgeStyle}`}>
              #{rank}
            </div>
          )}

          <div>
            <h3 className="text-xl font-extrabold text-[#0089e8] uppercase tracking-wide">
              {order.orderNumber}
            </h3>

            <div className="text-xs text-slate-600 mt-0.5 font-bold">
              Customer: <span className="text-[#0089e8] font-extrabold">{order.customerName || 'Walk-in'}</span>
              {order.customerPhone && <span className="text-slate-400"> • {order.customerPhone}</span>}
            </div>
          </div>
        </div>

        {/* Arrival & Live Waiting Timer */}
        <div className="text-right shrink-0">
          <div className="text-[11px] text-slate-500 font-bold">
            Arrived: <span className="text-slate-800 font-extrabold">{formatTime(order.createdAt)}</span>
          </div>
          <div className="flex items-center justify-end space-x-1 text-sm font-extrabold text-[#0089e8] mt-0.5">
            <Clock className="w-4 h-4 text-[#0089e8]" />
            <span>WAITING {liveWait}</span>
          </div>
        </div>
      </div>

      {/* Item Completion List */}
      <div className="space-y-2.5 flex-1">
        {order.items.map((item) => {
          const isItemDone = item.remainingQuantity === 0;
          return (
            <div
              key={item.orderItemId}
              className={`p-3.5 rounded-2xl border transition-all ${
                isItemDone
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-sky-50/60 border-sky-200 hover:border-[#0089e8]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 pr-2">
                  <div className="font-extrabold text-sm text-[#0089e8] uppercase">
                    {item.itemName}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-bold">
                    <span className="text-slate-900 font-black">{item.quantity}</span> total •{' '}
                    <span className="text-emerald-600 font-black">{item.completedQuantity}</span> completed •{' '}
                    <span className="text-[#0089e8] font-black">{item.remainingQuantity}</span> remaining
                  </div>
                  {item.notes && (
                    <div className="text-xs text-[#0089e8] font-bold italic mt-1">
                      Note: {item.notes}
                    </div>
                  )}
                </div>

                {/* Large Item Completion Control */}
                {!isItemDone ? (
                  <button
                    onClick={() => completeOrderItemUnit(order.orderId, item.orderItemId)}
                    className="bg-[#ffd400] hover:bg-[#ffe24d] text-[#00569e] font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shrink-0 transition-transform active:scale-95 shadow-md border border-[#ffd400] uppercase"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>✓ COMPLETE 1</span>
                  </button>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1.5 rounded-xl shrink-0 flex items-center space-x-1 border border-emerald-300">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>DONE</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-600">
            Progress: <strong className="text-[#0089e8]">{completedItems} / {totalItems}</strong> items done
          </span>
          <span className="text-[#0089e8] font-extrabold text-sm">
            {remainingItems} REMAINING
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 p-0.5">
          <div
            className="bg-gradient-to-r from-[#ffd400] to-[#0089e8] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer Controls & Details */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-extrabold">ORDER TOTAL</div>
          <div className="text-xl font-extrabold text-[#0089e8]">
            {formatCurrency(order.grandTotal, settings.currencySymbol)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {rank > 0 && (
            <button
              onClick={() => onExplainPriority(order)}
              className="bg-sky-50 hover:bg-sky-100 text-[#0089e8] border border-sky-200 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase flex items-center space-x-1 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-[#0089e8]" />
              <span className="hidden sm:inline">WHY PRIORITY?</span>
            </button>
          )}

          <button
            onClick={() => onOpenDetails(order)}
            className="bg-[#0089e8] hover:bg-[#0077cd] text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase flex items-center space-x-1 transition-all active:scale-95 border border-[#0077cd] shadow-md"
          >
            <Eye className="w-4 h-4 stroke-[2.5]" />
            <span>DETAILS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
