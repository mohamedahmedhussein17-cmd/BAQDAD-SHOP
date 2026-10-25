import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { RecordSaleModal } from './components/modals/RecordSaleModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { FrontPage } from './pages/FrontPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesPage } from './pages/SalesPage';
import { CustomerInfoPage } from './pages/CustomerInfoPage';
import { DebtRecordPage } from './pages/DebtRecordPage';
import { CustomerDebtRecordPage } from './pages/CustomerDebtRecordPage';
import { RevenuePage } from './pages/RevenuePage';
import { ExpensePage } from './pages/ExpensePage';
import { SettingsPage } from './pages/SettingsPage';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activePage } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'frontpage':
        return <FrontPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'sales':
        return <SalesPage />;
      case 'customers':
        return <CustomerInfoPage />;
      case 'debts':
        return <DebtRecordPage />;
      case 'customer-debts':
        return <CustomerDebtRecordPage />;
      case 'revenue':
        return <RevenuePage />;
      case 'expenses':
        return <ExpensePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F2EB] flex flex-col md:flex-row font-sans text-[#2D2723]">
      {/* Mobile Top Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#FAF7F2] border-b border-[#EBE3D7] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5C3826] text-white flex items-center justify-center font-bold text-sm">
            B
          </div>
          <span className="font-bold text-sm text-[#2D2723]">BAQDAD Shop</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white border border-[#E2D9CC] text-[#5C3826]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#FAF7F2] h-full shadow-2xl flex flex-col">
            <div className="p-3 flex justify-end">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-[#8C7E72] hover:bg-[#F2ECE3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader />
        <main className="flex-1 overflow-y-auto pb-12">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals */}
      <RecordSaleModal />
      <ReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainLayout />
    </ShopProvider>
  );
}
