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

  // Status Badge Styling (Section 19 Requirement: Subtle status indicators)
  const getStatusBadgeStyle = () => {
    switch (order.status) {
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'READY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  const getPriorityBadgeStyle = () => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'MEDIUM':
        return 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 font-medium';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3.5 shadow-saas hover:shadow-saas-hover transition-all">
      {/* Top Header Row */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          {rank > 0 && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border shrink-0 ${getPriorityBadgeStyle()}`}
            >
              #{rank} Priority
            </span>
          )}

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {order.orderNumber}
              </h3>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${getStatusBadgeStyle()}`}
              >
                {order.status.replace('_', ' ')}
              </span>
            </div>

            <div className="text-xs text-slate-500 mt-0.5 font-normal truncate">
              Customer:{' '}
              <span className="text-slate-800 font-medium">{order.customerName || 'Walk-in'}</span>
              {order.customerPhone && <span className="text-slate-400"> • {order.customerPhone}</span>}
            </div>
          </div>
        </div>

        {/* Arrival & Live Waiting Timer */}
        <div className="text-right shrink-0">
          <div className="text-[11px] text-slate-400 font-medium">
            Arrived {formatTime(order.createdAt)}
          </div>
          <div className="flex items-center justify-end space-x-1 text-xs font-semibold text-sky-600 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-sky-500" />
            <span>{liveWait}</span>
          </div>
        </div>
      </div>

      {/* Item Completion List */}
      <div className="space-y-2 flex-1">
        {order.items.map((item) => {
          const isItemDone = item.remainingQuantity === 0;
          return (
            <div
              key={item.orderItemId}
              className={`p-2.5 rounded-lg border transition-all ${
                isItemDone
                  ? 'bg-slate-50 border-slate-100 opacity-60'
                  : 'bg-slate-50/60 border-slate-200/80 hover:border-sky-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                    {item.itemName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    <span className="text-slate-800 font-semibold">{item.quantity}×</span> •{' '}
                    <span className="text-emerald-600 font-semibold">{item.completedQuantity}</span> done •{' '}
                    <span className="text-sky-600 font-semibold">{item.remainingQuantity}</span> left
                  </div>
                  {item.notes && (
                    <div className="text-[11px] text-sky-600 font-normal italic mt-0.5">
                      Note: {item.notes}
                    </div>
                  )}
                </div>

                {/* Item Completion Control */}
                {!isItemDone ? (
                  <button
                    onClick={() => completeOrderItemUnit(order.orderId, item.orderItemId)}
                    className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shrink-0 transition-all shadow-sm border border-sky-600"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Done 1</span>
                  </button>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-lg shrink-0 flex items-center space-x-1 border border-emerald-200">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Done</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 pt-2 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-slate-500">
            Progress: <strong className="text-slate-800">{completedItems}/{totalItems}</strong> items
          </span>
          <span className="text-sky-600 font-semibold text-xs">
            {remainingItems} remaining
          </span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-sky-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Footer Controls & Details */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</div>
          <div className="text-base sm:text-lg font-bold text-slate-900">
            {formatCurrency(order.grandTotal, settings.currencySymbol)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {rank > 0 && (
            <button
              onClick={() => onExplainPriority(order)}
              className="bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Priority</span>
            </button>
          )}

          <button
            onClick={() => onOpenDetails(order)}
            className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all border border-slate-200"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
