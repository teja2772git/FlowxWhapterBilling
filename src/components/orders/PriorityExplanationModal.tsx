import React from 'react';
import { HelpCircle, X, Clock, Layers, CheckCircle, ShieldAlert } from 'lucide-react';
import type { Order } from '../../types/order';
import { useApp } from '../../context/AppContext';

interface PriorityExplanationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const PriorityExplanationModal: React.FC<PriorityExplanationModalProps> = ({ order, onClose }) => {
  const { settings } = useApp();

  if (!order || !order.priorityInfo) return null;

  const p = order.priorityInfo;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-sky-500" />
            <span>Why Priority #{p.priorityRank}?</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-slate-800 text-xs">
          <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-sky-700 font-semibold uppercase tracking-wider">
                Priority Score
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                {p.priorityScore}
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500 text-white shadow-xs">
                {p.priorityLevel} Priority
              </span>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Queue Rank #{p.priorityRank}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Waiting Time</div>
                  <div className="text-[11px] text-slate-500">{p.waitMinutes} mins elapsed</div>
                </div>
              </div>
              <span className="font-bold text-emerald-600">+{p.agingScore} pts</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Layers className="w-4 h-4 text-sky-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Remaining Workload</div>
                  <div className="text-[11px] text-slate-500">{p.remainingItems} items remaining</div>
                </div>
              </div>
              <span className="font-bold text-sky-600">+{p.workloadScore} pts</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800">Completion Progress</div>
                  <div className="text-[11px] text-slate-500">{p.completedItems} / {p.totalItems} completed</div>
                </div>
              </div>
              <span className="font-bold text-slate-400">-{p.completionBonus} pts</span>
            </div>

            {p.starvationBoost > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-rose-800">Anti-Starvation Boost</div>
                    <div className="text-[11px] text-rose-600">Waiting &gt; {settings.starvationThresholdMinutes} mins</div>
                  </div>
                </div>
                <span className="font-bold text-rose-600">+{p.starvationBoost} pts</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-normal">
            The Smart Priority Algorithm balances order age, remaining item workload, and fairness to prevent customer starvation during rush crowds.
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
