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
      label: 'Billing',
      icon: ShoppingCart,
      badge: cartItemsCount > 0 ? cartItemsCount : null,
      badgeColor: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Flame,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: UtensilsCrossed,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Desktop Navigation Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 text-slate-800 shrink-0 p-3 space-y-4 shadow-saas transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-60'
        }`}
      >
        {/* Sidebar Header & Expand/Minimize Toggle Button */}
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } pb-2 border-b border-slate-100`}
        >
          {!isCollapsed && (
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Menu
            </span>
          )}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Minimize Sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all border border-slate-200 active:scale-95"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-sky-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-sky-500" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } py-2.5 rounded-xl font-semibold transition-all duration-150 text-sm relative group ${
                  isActive
                    ? 'bg-sky-50 text-sky-600 font-bold border-l-4 border-sky-500'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {item.badge !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isCollapsed
                        ? 'absolute -top-1 -right-1 text-[10px] px-1.5 py-0.2 border border-white'
                        : ''
                    } ${isActive ? 'bg-sky-500 text-white' : item.badgeColor}`}
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
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-left space-y-1">
            <div className="text-sky-600 font-semibold text-xs flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Smart Queue Engine</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Priority sorting active
            </div>
          </div>
        ) : (
          <div
            className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-center flex items-center justify-center"
            title="Smart Queue Engine Active"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </aside>

      {/* Mobile Navigation Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1.5 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-sky-50 text-sky-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {item.badge !== null && (
                  <span className="absolute -top-1 -right-2 text-[10px] bg-sky-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
