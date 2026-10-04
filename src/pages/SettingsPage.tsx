import React, { useState } from 'react';
import { Settings, Save, Download, Upload, RefreshCw, Sliders, ShieldCheck, FileSpreadsheet, Cloud } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, exportExcelDatabase, importExcelDatabase, resetToDefaults } = useApp();

  const [formSettings, setFormSettings] = useState({ ...settings });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccessMsg('Settings saved and applied immediately!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      await importExcelDatabase(file);
      alert('Excel workbook database imported successfully!');
    } catch (err: any) {
      alert(`Import failed: ${err.message || String(err)}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center space-x-3">
        <Settings className="w-7 h-7 text-[#ffd400]" />
        <h1 className="text-3xl font-black text-white uppercase font-display tracking-wide">
          SYSTEM & ENGINE SETTINGS
        </h1>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-950 border-2 border-emerald-500 text-emerald-300 p-3.5 rounded-2xl text-xs font-black uppercase font-display animate-in fade-in">
          ✓ {saveSuccessMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. General & POS Branding Settings */}
        <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-5 rounded-3xl space-y-4 shadow-xl">
          <h2 className="font-display text-lg text-[#ffd400] uppercase tracking-wide flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#ffd400]" />
            <span>STORE BRANDING & RECEIPT SETTINGS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">RESTAURANT NAME</label>
              <input
                type="text"
                value={formSettings.restaurantName}
                onChange={(e) => setFormSettings({ ...formSettings, restaurantName: e.target.value })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">TAGLINE</label>
              <input
                type="text"
                value={formSettings.restaurantTagline}
                onChange={(e) => setFormSettings({ ...formSettings, restaurantTagline: e.target.value })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">CURRENCY SYMBOL</label>
              <input
                type="text"
                value={formSettings.currencySymbol}
                onChange={(e) => setFormSettings({ ...formSettings, currencySymbol: e.target.value })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">RECEIPT FOOTER TEXT</label>
              <input
                type="text"
                value={formSettings.receiptFooterText}
                onChange={(e) => setFormSettings({ ...formSettings, receiptFooterText: e.target.value })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#ffd400]/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <label className="flex items-center space-x-3 bg-[#001b63] border border-[#ffd400]/40 p-3.5 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={formSettings.taxEnabled}
                onChange={(e) => setFormSettings({ ...formSettings, taxEnabled: e.target.checked })}
                className="w-4 h-4 text-[#ffd400] rounded accent-[#ffd400]"
              />
              <div>
                <div className="font-extrabold text-white uppercase">ENABLE GST TAX</div>
                <div className="text-[11px] text-white/70 font-normal">Automatically calculate tax on billing</div>
              </div>
            </label>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">GST TAX PERCENTAGE (%)</label>
              <input
                type="number"
                step="0.1"
                disabled={!formSettings.taxEnabled}
                value={formSettings.taxPercentage}
                onChange={(e) => setFormSettings({ ...formSettings, taxPercentage: Number(e.target.value) })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400] disabled:opacity-40"
              />
            </div>
          </div>
        </div>

        {/* 2. Priority Engine Tuning */}
        <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-5 rounded-3xl space-y-4 shadow-xl">
          <h2 className="font-display text-lg text-[#ffd400] uppercase tracking-wide flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#ffd400]" />
            <span>SMART PRIORITY ALGORITHM TUNING</span>
          </h2>
          <p className="text-xs text-white/80 font-bold">
            Tune queue scoring behavior dynamically without modifying source code.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold">
            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">AGING WEIGHT</label>
              <input
                type="number"
                step="0.1"
                value={formSettings.priorityAgingWeight}
                onChange={(e) => setFormSettings({ ...formSettings, priorityAgingWeight: Number(e.target.value) })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">WORKLOAD WEIGHT (PER ITEM)</label>
              <input
                type="number"
                step="0.1"
                value={formSettings.priorityWorkloadWeight}
                onChange={(e) => setFormSettings({ ...formSettings, priorityWorkloadWeight: Number(e.target.value) })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">COMPLETION BONUS WEIGHT</label>
              <input
                type="number"
                step="0.1"
                value={formSettings.priorityCompletionWeight}
                onChange={(e) => setFormSettings({ ...formSettings, priorityCompletionWeight: Number(e.target.value) })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">MAX WORKLOAD SCORE</label>
              <input
                type="number"
                value={formSettings.maxWorkloadScore}
                onChange={(e) => setFormSettings({ ...formSettings, maxWorkloadScore: Number(e.target.value) })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">ANTI-STARVATION THRESHOLD (MINS)</label>
              <input
                type="number"
                value={formSettings.starvationThresholdMinutes}
                onChange={(e) => setFormSettings({ ...formSettings, starvationThresholdMinutes: Number(e.target.value) })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>

            <div>
              <label className="block text-[#ffd400] font-black uppercase mb-1">ANTI-STARVATION BOOST / MIN</label>
              <input
                type="number"
                value={formSettings.starvationBoostPerMin}
                onChange={(e) => setFormSettings({ ...formSettings, starvationBoostPerMin: Number(e.target.value) })}
                className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
              />
            </div>
          </div>
        </div>

        {/* 3. Excel Storage & Backup Controls */}
        <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-5 rounded-3xl space-y-4 shadow-xl">
          <h2 className="font-display text-lg text-[#ffd400] uppercase tracking-wide flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>EXCEL WORKBOOK PERSISTENCE & DATA TOOLS</span>
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportExcelDatabase}
              className="bg-[#001b63] hover:bg-[#002e99] text-[#ffd400] border-2 border-[#ffd400]/60 px-4 py-3 rounded-2xl font-black text-xs uppercase flex items-center space-x-2 shadow-md font-display"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD EXCEL WORKBOOK (.XLSX)</span>
            </button>

            <label className="bg-[#001b63] hover:bg-[#002e99] text-white border-2 border-[#ffd400]/40 px-4 py-3 rounded-2xl font-black text-xs uppercase flex items-center space-x-2 cursor-pointer shadow-md font-display">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{isImporting ? 'IMPORTING...' : 'UPLOAD EXCEL WORKBOOK'}</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset database to default initial menu and clear order history?')) {
                  resetToDefaults();
                }
              }}
              className="bg-red-950 hover:bg-red-900 text-red-200 border-2 border-red-500 px-4 py-3 rounded-2xl font-black text-xs uppercase flex items-center space-x-2 ml-auto font-display"
            >
              <RefreshCw className="w-4 h-4" />
              <span>RESET DATABASE TO DEFAULTS</span>
            </button>
          </div>
        </div>

        {/* 4. MS Graph Settings */}
        <div className="bg-[#00247d] border-2 border-[#ffd400]/60 p-5 rounded-3xl space-y-4 shadow-xl">
          <h2 className="font-display text-lg text-[#ffd400] uppercase tracking-wide flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-300" />
            <span>MICROSOFT 365 / GRAPH API INTEGRATION</span>
          </h2>

          <label className="flex items-center space-x-3 bg-[#001b63] border border-[#ffd400]/40 p-3.5 rounded-2xl cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={formSettings.msGraphEnabled}
              onChange={(e) => setFormSettings({ ...formSettings, msGraphEnabled: e.target.checked })}
              className="w-4 h-4 text-[#ffd400] rounded accent-[#ffd400]"
            />
            <div>
              <div className="font-extrabold text-white uppercase">ENABLE MICROSOFT GRAPH ONLINE SYNC</div>
              <div className="text-[11px] text-white/70 font-normal">Sync workbook directly to OneDrive / SharePoint Online</div>
            </div>
          </label>

          {formSettings.msGraphEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold pt-2">
              <div>
                <label className="block text-[#ffd400] font-black uppercase mb-1">AZURE TENANT ID</label>
                <input
                  type="text"
                  placeholder="e.g. 00000000-0000-0000-0000-000000000000"
                  value={formSettings.msGraphTenantId}
                  onChange={(e) => setFormSettings({ ...formSettings, msGraphTenantId: e.target.value })}
                  className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
                />
              </div>

              <div>
                <label className="block text-[#ffd400] font-black uppercase mb-1">APP CLIENT ID</label>
                <input
                  type="text"
                  placeholder="e.g. 00000000-0000-0000-0000-000000000000"
                  value={formSettings.msGraphClientId}
                  onChange={(e) => setFormSettings({ ...formSettings, msGraphClientId: e.target.value })}
                  className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
                />
              </div>

              <div>
                <label className="block text-[#ffd400] font-black uppercase mb-1">ONEDRIVE DRIVE ITEM ID</label>
                <input
                  type="text"
                  placeholder="Drive Item ID for Flow_POS_Database.xlsx"
                  value={formSettings.msGraphDriveItemId}
                  onChange={(e) => setFormSettings({ ...formSettings, msGraphDriveItemId: e.target.value })}
                  className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
                />
              </div>

              <div>
                <label className="block text-[#ffd400] font-black uppercase mb-1">REMOTE FILE NAME</label>
                <input
                  type="text"
                  value={formSettings.msGraphFileName}
                  onChange={(e) => setFormSettings({ ...formSettings, msGraphFileName: e.target.value })}
                  className="w-full bg-[#001b63] border border-[#ffd400]/40 rounded-2xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-[#ffd400]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-[#ffd400] hover:bg-[#ffe24d] text-[#00247d] font-black px-8 py-4 rounded-2xl flex items-center space-x-2 transition-transform active:scale-95 shadow-xl border-2 border-white text-sm uppercase tracking-wider font-display"
          >
            <Save className="w-5 h-5 stroke-[3]" />
            <span>SAVE SETTINGS</span>
          </button>
        </div>
      </form>
    </div>
  );
};
