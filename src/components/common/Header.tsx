import React from 'react';
import { Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const { settings, excelSync, exportExcelDatabase } = useApp();

  return (
    <div className="bg-white text-slate-900 border-b-2 border-slate-200 sticky top-0 z-30 shadow-sm">
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* FLOW Brand Header Wordmark */}
        <div className="flex items-center space-x-4">
          <div className="bg-[#0089e8] text-white p-2.5 rounded-2xl shadow-md flex items-center justify-center font-black">
            <span className="font-display text-2xl tracking-tighter uppercase leading-none">FLOW</span>
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0089e8] uppercase tracking-tight">
                {settings.restaurantName}
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              {settings.restaurantTagline}
            </p>
          </div>
        </div>

        {/* Right Controls & Excel Status Indicator */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Subtle Excel Status Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-slate-700 font-bold shadow-sm">
            {excelSync.isSaving ? (
              <span className="flex items-center text-[#0089e8] font-extrabold animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5 text-[#0089e8]" /> SYNCING EXCEL...
              </span>
            ) : (
              <span className="flex items-center text-emerald-600 font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> EXCEL SYNCED
              </span>
            )}
          </div>

          {/* Export Excel Workbook Button */}
          <button
            onClick={exportExcelDatabase}
            title="Download Excel Database Workbook"
            className="bg-[#0089e8] hover:bg-[#0077cd] text-white px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 font-extrabold uppercase tracking-wider transition-all active:scale-95 shadow-md border border-[#0077cd]"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">EXPORT EXCEL</span>
          </button>
        </div>
      </div>

      {/* Subtle Blue Divider Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0089e8] via-[#ffd400] to-[#0089e8]" />
    </div>
  );
};
