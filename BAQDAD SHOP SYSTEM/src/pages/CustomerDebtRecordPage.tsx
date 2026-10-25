import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { DebtRecord, Customer } from '../types';
import { RecordDebtPaymentModal } from '../components/modals/RecordDebtPaymentModal';
import {
  CreditCard,
  Search,
  Plus,
  DollarSign,
  User,
  Clock,
  Printer,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const CustomerDebtRecordPage: React.FC = () => {
  const { customers, debts, formatCurrency, totalCustomerDebt, settings } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerStatement, setSelectedCustomerStatement] = useState<Customer | null>(null);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [debtRecordToPay, setDebtRecordToPay] = useState<DebtRecord | null>(null);

  // Customer debt records only
  const customerDebts = useMemo(() => {
    return debts.filter(d => d.type === 'CUSTOMER');
  }, [debts]);

  // Active debtor customers (outstanding debt > 0)
  const debtorCustomers = useMemo(() => {
    return customers.filter(c => {
      if (c.outstandingDebt <= 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.address && c.address.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [customers, searchQuery]);

  const handleOpenPaymentForCustomer = (cust: Customer) => {
    // Look up an unpaid debt record for this customer
    const activeDebt = customerDebts.find(
      d => (d.customerId === cust.id || d.partyName === cust.name) && d.remainingBalance > 0
    );

    if (activeDebt) {
      setDebtRecordToPay(activeDebt);
      setIsPaymentModalOpen(true);
    }
  };

  const handleOpenStatement = (cust: Customer) => {
    setSelectedCustomerStatement(cust);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] tracking-tight">
            Customer Debt & Credit Ledger
          </h1>
          <p className="text-xs md:text-sm text-[#7D7065] mt-1">
            Dedicated customer credit tracking, outstanding balances, and repayment history.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Total Outstanding Customer Debt
          </span>
          <p className="text-3xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {formatCurrency(totalCustomerDebt)}
          </p>
          <span className="text-[11px] text-[#706458]">Awaiting collection</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Active Debt Accounts
          </span>
          <p className="text-3xl font-bold font-mono text-[#5C3826] mt-1 tabular-nums">
            {debtorCustomers.length}
          </p>
          <span className="text-[11px] text-[#706458]">Customers with balance</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Settled Customer Records
          </span>
          <p className="text-3xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {customerDebts.filter(d => d.status === 'Settled').length}
          </p>
          <span className="text-[11px] text-[#706458]">Fully resolved debt transactions</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#EBE3D7] shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9285]" />
          <input
            type="text"
            placeholder="Search debtor name, phone, address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
          />
        </div>
        <span className="text-xs text-[#8C7E72] hidden sm:block">
          {debtorCustomers.length} customers with outstanding balances
        </span>
      </div>

      {/* Customer Debt Table */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EBE3D7] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#231F1C]">
            Customer Credit Balances
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EBE3D7] text-[#706458] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Lifetime Purchases</th>
                <th className="py-3.5 px-4 text-right">Outstanding Debt</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F5EFE6]">
              {debtorCustomers.map(c => (
                <tr key={c.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                  {/* Name */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-sm text-[#231F1C] block">{c.name}</span>
                    {c.notes && (
                      <span className="text-[11px] text-[#8C7E72] line-clamp-1 italic">
                        "{c.notes}"
                      </span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-[#231F1C]">
                    {c.phone}
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-[#5A524A]">
                    {c.address || '—'}
                  </td>

                  {/* Purchases */}
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#706458]">
                    {formatCurrency(c.totalPurchases)}
                  </td>

                  {/* Debt */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono text-sm font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 tabular-nums">
                      {formatCurrency(c.outstandingDebt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenStatement(c)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#5C3826] bg-[#FAF5EE] hover:bg-[#F2ECE3] border border-[#E2D9CC] rounded-xl transition-colors cursor-pointer"
                      >
                        Statement
                      </button>
                      <button
                        onClick={() => handleOpenPaymentForCustomer(c)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#5C3826] hover:bg-[#482B1D] rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Receive Payment
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {debtorCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8C7E72]">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    Great news! No customers currently have outstanding debts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Debt Statement Modal */}
      {selectedCustomerStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2] no-print">
              <span className="text-xs font-bold text-[#5C3826] uppercase">
                Customer Debt Statement
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#5C3826] hover:bg-[#482B1D] rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Statement</span>
                </button>
                <button
                  onClick={() => setSelectedCustomerStatement(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#8C7E72] hover:bg-[#F2ECE3] rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6 font-mono text-xs overflow-y-auto space-y-4">
              <div className="text-center pb-4 border-b border-dashed border-[#CFC5B8]">
                <h2 className="text-base font-bold text-[#1A1816] uppercase">{settings.shopName}</h2>
                <p className="text-[11px] text-[#706458]">Official Customer Debt Statement</p>
                <p className="text-[10px] text-[#8C7E72]">Date Generated: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl space-y-1 text-xs">
                <div>Customer Name: <strong>{selectedCustomerStatement.name}</strong></div>
                <div>Phone: <strong>{selectedCustomerStatement.phone}</strong></div>
                {selectedCustomerStatement.address && <div>Address: {selectedCustomerStatement.address}</div>}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#231F1C] uppercase text-[11px]">Associated Debt Accounts</h4>
                <div className="divide-y divide-[#F5EFE6] border border-[#EBE3D7] rounded-xl overflow-hidden">
                  {customerDebts
                    .filter(
                      d =>
                        d.customerId === selectedCustomerStatement.id ||
                        d.partyName === selectedCustomerStatement.name
                    )
                    .map(d => (
                      <div key={d.id} className="p-3 text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-[#231F1C] block">{d.notes || 'Credit Sale'}</span>
                          <span className="text-[10px] text-[#8C7E72]">
                            Date: {new Date(d.createdDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-700 block">
                            Balance: {formatCurrency(d.remainingBalance)}
                          </span>
                          <span className="text-[10px] text-[#8C7E72]">
                            Paid: {formatCurrency(d.amountPaid)} / Total: {formatCurrency(d.totalDebt)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex justify-between items-center">
                <span className="font-bold text-rose-900 text-sm">TOTAL AMOUNT OWED:</span>
                <span className="font-bold text-lg text-rose-900 font-mono">
                  {formatCurrency(selectedCustomerStatement.outstandingDebt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <RecordDebtPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        debtRecord={debtRecordToPay}
      />
    </div>
  );
};
