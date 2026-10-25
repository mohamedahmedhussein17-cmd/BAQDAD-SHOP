import React from 'react';
import { useShop } from '../../context/ShopContext';
import { PageId } from '../../types';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileSpreadsheet,
  TrendingUp,
  Receipt,
  Settings,
  Store,
  Lightbulb,
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'alert' | 'neutral';
}

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, lowStockProducts, outOfStockProducts, products, settings } = useShop();

  const totalAlertItems = lowStockProducts.length + outOfStockProducts.length;

  const navItems: NavItem[] = [
    {
      id: 'frontpage',
      label: 'Front Page',
      icon: Store
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      badge: totalAlertItems > 0 ? totalAlertItems : products.length,
      badgeType: totalAlertItems > 0 ? 'alert' : 'neutral'
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingBag
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users
    },
    {
      id: 'debts',
      label: 'Debt Records',
      icon: FileSpreadsheet
    },
    {
      id: 'customer-debts',
      label: 'Customer Debts',
      icon: CreditCard
    },
    {
      id: 'revenue',
      label: 'Revenue',
      icon: TrendingUp
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: Receipt
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-[#FAF7F2] border-r border-[#EBE3D7] flex flex-col justify-between h-screen sticky top-0 select-none shrink-0 overflow-y-auto">
      <div className="p-5">
        {/* Brand Header */}
        <div className="mb-6 px-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5C3826] flex items-center justify-center text-white shadow-xs font-serif font-black text-lg">
            B
          </div>
          <div>
            <h1 className="text-base font-bold text-[#2D2723] tracking-tight leading-tight">
              {settings.shopName || 'BAQDAD Shop'}
            </h1>
            <p className="text-[11px] text-[#8C7E72] font-medium leading-none mt-0.5">
              Management System
            </p>
          </div>
        </div>

        {/* Section Heading */}
        <div className="px-3 mb-2">
          <span className="text-[11px] font-bold tracking-[0.14em] text-[#8C7E72] uppercase">
            MAIN MENU
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#5C3826] text-white shadow-xs font-semibold'
                    : 'text-[#4A433D] hover:bg-[#F2ECE3] hover:text-[#2D2723]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-[#7D7065]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeType === 'alert'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-[#EAE2D5] text-[#5C3826]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Helpful Tip Box at the bottom of the sidebar */}
      <div className="p-4 m-3 bg-[#F3ECE0] border border-[#E6DCce] rounded-2xl">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-[#E7DCCE] flex items-center justify-center text-[#5C3826]">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[#5C3826]">Helpful Tip</span>
        </div>
        <p className="text-xs text-[#706458] leading-relaxed">
          Keep your stock updated to ensure accurate profit margins and avoid running out of top-selling items.
        </p>
      </div>
    </aside>
  );
};
