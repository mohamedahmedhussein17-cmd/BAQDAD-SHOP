import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { PageId } from '../../types';
import { Bell, AlertTriangle, CheckCircle2, ChevronRight, User } from 'lucide-react';

const pageTitles: Record<PageId, string> = {
  frontpage: 'Shop Front & Quick Launch',
  dashboard: 'Dashboard',
  inventory: 'Inventory & Products',
  sales: 'Sales Records & POS',
  customers: 'Customer Directory',
  debts: 'Shop Debt Records',
  'customer-debts': 'Customer Debt Ledger',
  revenue: 'Revenue & Profit Analytics',
  expenses: 'Expense Management',
  settings: 'Shop Settings'
};

export const TopHeader: React.FC = () => {
  const { activePage, setActivePage, settings, lowStockProducts, outOfStockProducts, products } = useShop();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentDateStr = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const alertCount = lowStockProducts.length + outOfStockProducts.length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#F7F2EB]/90 backdrop-blur-md border-b border-[#EBE3D7]/80">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setActivePage('dashboard')}
          className="font-medium text-[#7A6E63] hover:text-[#5C3826] transition-colors whitespace-nowrap cursor-pointer"
        >
          {settings.shopName || 'BAQDAD Shop'}
        </button>
        <span className="text-[#C2B7A8]">/</span>
        <span className="font-semibold text-[#2D2723] whitespace-nowrap">
          {pageTitles[activePage] || 'Dashboard'}
        </span>
      </div>

      {/* Right zone: Date, Alert bell with dropdown, and Admin avatar */}
      <div className="flex items-center gap-3">
        {/* Date pill box */}
        <div className="hidden sm:flex items-center px-4 py-2 text-xs font-medium text-[#5A524A] bg-[#FFFFFF]/80 border border-[#E7DFD3] rounded-xl shadow-xs tabular-nums">
          {currentDateStr}
        </div>

        {/* Alerts / Low Stock Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative flex items-center justify-center w-10 h-10 bg-white border border-[#E7DFD3] rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer text-[#5C3826]"
            aria-label="Stock alerts"
            title="Stock alerts"
          >
            <Bell className="w-4 h-4 text-[#5C3826]" />
            {alertCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#D9381E] rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E7DFD3] rounded-2xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0E9DF]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  <span className="text-sm font-semibold text-[#2D2723]">Stock Alerts</span>
                </div>
                <span className="text-xs font-medium text-[#8C7E72] px-2 py-0.5 bg-[#F5EFE6] rounded-md">
                  {alertCount} alert{alertCount !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[#F5EFE6] my-2">
                {alertCount === 0 ? (
                  <div className="py-6 text-center text-xs text-[#8C7E72]">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    All stock levels healthy! No items below threshold.
                  </div>
                ) : (
                  <>
                    {outOfStockProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActivePage('inventory');
                          setShowNotifications(false);
                        }}
                        className="py-2.5 px-2 hover:bg-[#FAF6F0] rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#D9381E] truncate max-w-[170px]">
                            {p.name}
                          </span>
                          <span className="text-[11px] font-bold text-[#D9381E] px-1.5 py-0.5 bg-rose-50 border border-rose-200 rounded">
                            Out of Stock
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8C7E72] mt-0.5 flex justify-between">
                          <span>SKU: {p.sku}</span>
                          <span className="font-mono text-rose-700">0 units left</span>
                        </div>
                      </div>
                    ))}
                    {lowStockProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setActivePage('inventory');
                          setShowNotifications(false);
                        }}
                        className="py-2.5 px-2 hover:bg-[#FAF6F0] rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#8F4E08] truncate max-w-[170px]">
                            {p.name}
                          </span>
                          <span className="text-[11px] font-bold text-[#B45309] px-1.5 py-0.5 bg-amber-50 border border-amber-200 rounded">
                            Low Stock
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8C7E72] mt-0.5 flex justify-between">
                          <span>SKU: {p.sku}</span>
                          <span className="font-mono text-amber-700 font-semibold">{p.quantity} units left</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  setActivePage('inventory');
                  setShowNotifications(false);
                }}
                className="w-full mt-2 py-2 text-xs font-semibold text-[#5C3826] bg-[#FAF5EE] hover:bg-[#F0E6D8] border border-[#E7DFD3] rounded-xl transition-colors text-center"
              >
                Manage Inventory & Restock
              </button>
            </div>
          )}
        </div>

        {/* Admin Avatar Circle 'A' */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#5C3826] text-white font-semibold text-sm shadow-xs hover:bg-[#482B1D] transition-colors cursor-pointer"
            title={settings.adminName}
          >
            {settings.adminName ? settings.adminName.charAt(0).toUpperCase() : 'A'}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E7DFD3] rounded-2xl shadow-xl p-3 z-50">
              <div className="px-3 py-2 border-b border-[#F0E9DF]">
                <p className="text-sm font-semibold text-[#2D2723]">{settings.adminName}</p>
                <p className="text-xs text-[#8C7E72]">{settings.adminRole}</p>
                <p className="text-xs text-[#8C7E72] truncate">{settings.adminEmail}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setActivePage('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[#4A433D] hover:bg-[#FAF6F0] rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>Shop Settings & Backup</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A89C8F]" />
                </button>
                <button
                  onClick={() => {
                    setActivePage('frontpage');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-[#4A433D] hover:bg-[#FAF6F0] rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>Front Store Portal</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#A89C8F]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
