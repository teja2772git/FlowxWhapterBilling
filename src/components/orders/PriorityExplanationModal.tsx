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
    <div className="fixed inset-0 bg-[#001a5e]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#00247d] border-4 border-[#ffd400] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#001b63] px-6 py-4 border-b-2 border-[#ffd400]/40 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#ffd400] font-black text-base font-display">
            <HelpCircle className="w-5 h-5" />
            <span>WHY PRIORITY #{p.priorityRank}?</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-[#0038a8] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-white text-sm">
          <div className="bg-[#001a5e] p-4 rounded-2xl border-2 border-[#ffd400]/40 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#ffd400] uppercase tracking-wider font-black">
                PRIORITY SCORE
              </div>
              <div className="text-4xl font-black text-[#ffd400] font-display mt-0.5">
                {p.priorityScore}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border border-white ${
                p.priorityLevel === 'CRITICAL' ? 'bg-red-600 text-white' :
                p.priorityLevel === 'HIGH' ? 'bg-orange-500 text-white' :
                p.priorityLevel === 'MEDIUM' ? 'bg-[#ffd400] text-[#00247d]' :
                'bg-emerald-500 text-white'
              }`}>
                {p.priorityLevel} PRIORITY
              </span>
              <div className="text-xs text-white/80 font-bold mt-1">
                Queue Rank #{p.priorityRank}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="bg-[#001b63] border border-[#ffd400]/30 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-300 shrink-0" />
                <div>
                  <div className="font-extrabold text-white text-xs">Waiting Time</div>
                  <div className="text-xs text-white/80">{p.waitMinutes} mins elapsed</div>
                </div>
              </div>
              <span className="font-black text-emerald-400 text-sm">+{p.agingScore} pts</span>
            </div>

            <div className="bg-[#001b63] border border-[#ffd400]/30 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Layers className="w-5 h-5 text-[#ffd400] shrink-0" />
                <div>
                  <div className="font-extrabold text-white text-xs">Remaining Workload</div>
                  <div className="text-xs text-white/80">{p.remainingItems} items remaining</div>
                </div>
              </div>
              <span className="font-black text-[#ffd400] text-sm">+{p.workloadScore} pts</span>
            </div>

            <div className="bg-[#001b63] border border-[#ffd400]/30 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-extrabold text-white text-xs">Completion Progress</div>
                  <div className="text-xs text-white/80">{p.completedItems} / {p.totalItems} completed</div>
                </div>
              </div>
              <span className="font-black text-white/60 text-sm">-{p.completionBonus} pts</span>
            </div>

            {p.starvationBoost > 0 && (
              <div className="bg-red-950/80 border-2 border-red-500 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <div className="font-extrabold text-red-200 text-xs">Anti-Starvation Boost</div>
                    <div className="text-xs text-red-300">Waiting &gt; {settings.starvationThresholdMinutes} mins</div>
                  </div>
                </div>
                <span className="font-black text-red-400 text-sm">+{p.starvationBoost} pts</span>
              </div>
            )}
          </div>

          <div className="text-xs text-white/90 bg-[#001a5e] p-3.5 rounded-2xl border border-[#ffd400]/30 leading-relaxed font-bold">
            The Smart Priority Algorithm balances order age, remaining item workload, and fairness to prevent customer starvation during rush crowds.
          </div>
        </div>

        <div className="bg-[#001b63] px-6 py-4 border-t-2 border-[#ffd400]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#ffd400] hover:bg-[#ffe24d] text-[#00247d] rounded-xl text-xs font-black uppercase font-display border-2 border-white shadow-md"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
