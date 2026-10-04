import React, { useState } from 'react';
import { ShoppingCart, Flame, UtensilsCrossed, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { orders, cart } = useApp();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('flow_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('flow_sidebar_collapsed', String(next));
      return next;
    });
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'IN_PROGRESS'
  ).length;

  const cartItemsCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const navItems = [
    {
      id: 'billing',
      label: 'BILLING',
      icon: ShoppingCart,
      badge: cartItemsCount > 0 ? cartItemsCount : null,
      badgeColor: 'bg-[#ffd400] text-[#00247d]',
    },
    {
      id: 'orders',
      label: 'ORDERS',
      icon: Flame,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: 'bg-red-500 text-white animate-pulse',
    },
    {
      id: 'menu',
      label: 'MENU',
      icon: UtensilsCrossed,
    },
    {
      id: 'reports',
      label: 'REPORTS',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop Navigation Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r-2 border-slate-200 text-slate-800 shrink-0 p-3 space-y-4 shadow-sm transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Brand Tagline Badge */}
        {!isCollapsed && (
          <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl text-center shadow-sm">
            <div className="text-[#0089e8] font-extrabold text-base tracking-wide uppercase leading-tight">
              GOOD FOOD GREAT VIBES!
            </div>
            <div className="text-[11px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">
              Let's go with the FLOW!
            </div>
          </div>
        )}

        {/* Sidebar Header & Expand/Minimize Toggle Button */}
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } pb-2 border-b border-slate-200`}
        >
          {!isCollapsed && (
            <span className="text-xs font-extrabold text-[#0089e8] uppercase tracking-widest px-1">
              NAVIGATION
            </span>
          )}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Minimize Sidebar'}
            className="p-2 rounded-xl text-slate-600 hover:text-[#0089e8] hover:bg-sky-50 transition-all border border-slate-200 shadow-sm active:scale-95"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-[#0089e8]" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-[#0089e8]" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'
                } py-3.5 rounded-2xl font-extrabold transition-all duration-200 text-sm tracking-wider uppercase relative group ${
                  isActive
                    ? 'bg-[#0089e8] text-white shadow-lg shadow-[#0089e8]/30 border-l-4 border-[#ffd400] translate-x-0.5'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-[#0089e8] border border-transparent'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3.5'}`}>
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#0089e8]'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold shadow-sm ${
                      isCollapsed
                        ? 'absolute -top-1 -right-1 text-[10px] px-1.5 py-0.2 border border-white'
                        : ''
                    } ${isActive ? 'bg-[#ffd400] text-[#00569e]' : item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Engine Badge */}
        {!isCollapsed ? (
          <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl text-center space-y-1">
            <div className="text-[#0089e8] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
              <span>SMART QUEUE ENGINE</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Dynamic priority order sorting active
            </div>
          </div>
        ) : (
          <div
            className="bg-sky-50 border border-sky-200 p-2.5 rounded-2xl text-center flex items-center justify-center"
            title="Smart Queue Engine Active"
          >
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          </div>
        )}
      </aside>

      {/* Mobile Navigation Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-200 z-40 px-2 py-2 flex justify-around items-center shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#0089e8] text-white font-extrabold shadow-md scale-105'
                  : 'text-slate-600 hover:text-[#0089e8]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#0089e8]'}`} />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 text-[10px] bg-[#ffd400] text-[#00569e] px-1.5 py-0.2 rounded-full font-extrabold border border-[#0089e8]">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
