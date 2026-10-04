import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

interface OrderFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  priorityFilter: string;
  setPriorityFilter: (p: string) => void;
  sortMode: 'SMART_PRIORITY' | 'OLDEST_FIRST';
  setSortMode: (m: 'SMART_PRIORITY' | 'OLDEST_FIRST') => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortMode,
  setSortMode,
}) => {
  return (
    <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-4 rounded-3xl space-y-3 shadow-xl">
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#ffd400] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white font-bold placeholder-white/50 focus:outline-none focus:border-[#ffd400]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-xs text-[#ffd400] hover:text-white font-black uppercase"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0 bg-[#001b63] border border-[#ffd400]/40 p-1.5 rounded-2xl text-xs">
          <span className="text-[#ffd400] font-black px-2 flex items-center space-x-1 font-display">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#ffd400]" />
            <span>SORT:</span>
          </span>

          <button
            onClick={() => setSortMode('SMART_PRIORITY')}
            className={`px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider transition-colors ${
              sortMode === 'SMART_PRIORITY'
                ? 'bg-[#ffd400] text-[#00247d] shadow-md border-2 border-white font-display'
                : 'text-white/80 hover:text-[#ffd400]'
            }`}
          >
            SMART PRIORITY
          </button>

          <button
            onClick={() => setSortMode('OLDEST_FIRST')}
            className={`px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider transition-colors ${
              sortMode === 'OLDEST_FIRST'
                ? 'bg-[#ffd400] text-[#00247d] shadow-md border-2 border-white font-display'
                : 'text-white/80 hover:text-[#ffd400]'
            }`}
          >
            OLDEST FIRST
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#ffd400]/30 text-xs">
        <span className="text-[#ffd400] font-black uppercase text-[10px] mr-1">STATUS:</span>
        {['ACTIVE', 'ALL', 'PENDING', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-black uppercase text-[11px] transition-all ${
              statusFilter === st
                ? 'bg-[#ffd400] text-[#00247d] shadow-sm border border-white font-display'
                : 'bg-[#001b63] text-white/80 border border-[#ffd400]/30 hover:text-[#ffd400]'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}

        <div className="ml-auto flex items-center space-x-1">
          <span className="text-[#ffd400] font-black uppercase text-[10px] mr-1">PRIORITY:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#001b63] border border-[#ffd400]/40 text-white font-bold rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#ffd400]"
          >
            <option value="ALL">ALL PRIORITIES</option>
            <option value="CRITICAL">CRITICAL PRIORITY</option>
            <option value="HIGH">HIGH PRIORITY</option>
            <option value="MEDIUM">MEDIUM PRIORITY</option>
            <option value="NORMAL">NORMAL PRIORITY</option>
          </select>
        </div>
      </div>
    </div>
  );
};
