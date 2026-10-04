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
    <div className="bg-white border border-slate-200 p-3.5 rounded-xl space-y-3 shadow-saas">
      {/* Search Bar & Sort Segmented Control */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search orders by #, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-sky-600 hover:text-sky-700 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Segmented Control */}
        <div className="flex items-center space-x-1.5 shrink-0 bg-slate-100/80 p-1 rounded-lg text-xs w-full sm:w-auto justify-center sm:justify-start">
          <span className="text-slate-500 font-medium text-[11px] px-1.5 flex items-center space-x-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sort:</span>
          </span>

          <button
            onClick={() => setSortMode('SMART_PRIORITY')}
            className={`px-3 py-1 rounded-md font-semibold text-xs transition-all ${
              sortMode === 'SMART_PRIORITY'
                ? 'bg-white text-sky-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Smart Priority
          </button>

          <button
            onClick={() => setSortMode('OLDEST_FIRST')}
            className={`px-3 py-1 rounded-md font-semibold text-xs transition-all ${
              sortMode === 'OLDEST_FIRST'
                ? 'bg-white text-sky-600 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Oldest First
          </button>
        </div>
      </div>

      {/* Status Filter Pills & Priority Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
        {/* Status Filter Pills - Horizontally Scrollable on Mobile */}
        <div className="flex items-center space-x-1.5 overflow-x-auto flex-nowrap py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0 mr-1">
            Status:
          </span>
          {['ACTIVE', 'ALL', 'PENDING', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full font-semibold text-xs whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-sky-100 text-sky-700 border border-sky-200 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            );
          })}
        </div>

        {/* Priority Filter Dropdown */}
        <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            Priority:
          </span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-medium rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 shadow-sm"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="NORMAL">Normal Priority</option>
          </select>
        </div>
      </div>
    </div>
  );
};
