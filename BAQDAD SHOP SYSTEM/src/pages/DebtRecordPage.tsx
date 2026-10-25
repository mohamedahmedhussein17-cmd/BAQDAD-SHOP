import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { DebtRecord } from '../types';
import { RecordDebtPaymentModal } from '../components/modals/RecordDebtPaymentModal';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  User,
  X
} from 'lucide-react';

export const DebtRecordPage: React.FC = () => {
  const { debts, addDebtRecord, formatCurrency, totalCustomerDebt, totalSupplierDebt } = useShop();

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Unpaid' | 'Partially Paid' | 'Settled'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Payment modal state
  const [paymentTarget, setPaymentTarget] = useState<DebtRecord | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // New debt modal state
  const [isNewDebtModalOpen, setIsNewDebtModalOpen] = useState(false);
  const [newType, setNewType] = useState<'CUSTOMER' | 'SUPPLIER'>('SUPPLIER');
  const [newPartyName, setNewPartyName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Filtered debts
  const filteredDebts = useMemo(() => {
    return debts.filter(d => {
      if (typeFilter !== 'ALL' && d.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          d.partyName.toLowerCase().includes(q) ||
          (d.notes && d.notes.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [debts, typeFilter, statusFilter, searchQuery]);

  const handleOpenPayment = (debt: DebtRecord) => {
    setPaymentTarget(debt);
    setIsPaymentModalOpen(true);
  };

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (!newPartyName.trim() || isNaN(amt) || amt <= 0) return;

    addDebtRecord({
      type: newType,
      partyName: newPartyName.trim(),
      totalDebt: amt,
      dueDate: newDueDate || undefined,
      notes: newNotes.trim() || undefined
    });

    setIsNewDebtModalOpen(false);
    setNewPartyName('');
    setNewAmount('');
    setNewDueDate('');
    setNewNotes('');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] tracking-tight">
            Shop Debt & Liabilities Master Record
          </h1>
          <p className="text-xs md:text-sm text-[#7D7065] mt-1">
            Track receivables (customer debts) and payables (supplier invoices and store liabilities).
          </p>
        </div>

        <button
          onClick={() => setIsNewDebtModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#5C3826] hover:bg-[#482B1D] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Debt / Supplier Bill</span>
        </button>
      </div>

      {/* KPI Cards: Receivables vs Payables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold mb-1">
            <User className="w-4 h-4" />
            <span>Customer Receivables (Money Owed to Us)</span>
          </div>
          <p className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {formatCurrency(totalCustomerDebt)}
          </p>
          <span className="text-[11px] text-[#706458]">Total balance awaiting collection</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <div className="flex items-center gap-2 text-[#5C3826] text-xs font-bold mb-1">
            <Building2 className="w-4 h-4" />
            <span>Supplier Payables (Money We Owe)</span>
          </div>
          <p className="text-2xl font-bold font-mono text-[#5C3826] tabular-nums">
            {formatCurrency(totalSupplierDebt)}
          </p>
          <span className="text-[11px] text-[#706458]">Outstanding supplier invoices</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <div className="flex items-center gap-2 text-[#2D6A4F] text-xs font-bold mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Total Debts Settled</span>
          </div>
          <p className="text-2xl font-bold font-mono text-[#2D6A4F] tabular-nums">
            {debts.filter(d => d.status === 'Settled').length}
          </p>
          <span className="text-[11px] text-[#706458]">Cleared accounts</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-[#EBE3D7] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9285]" />
            <input
              type="text"
              placeholder="Search by party name or reference..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-[#5C3826] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#4A433D] hover:bg-[#F2ECE3]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('CUSTOMER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === 'CUSTOMER'
                  ? 'bg-rose-800 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Customer Debts
            </button>
            <button
              onClick={() => setTypeFilter('SUPPLIER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === 'SUPPLIER'
                  ? 'bg-[#5C3826] text-white shadow-xs'
                  : 'bg-[#FAF5EE] text-[#5C3826] hover:bg-[#F2ECE3]'
              }`}
            >
              Supplier Debts
            </button>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#F5EFE6]">
          <span className="text-[11px] font-bold text-[#8C7E72] uppercase shrink-0">
            Status:
          </span>
          {(['ALL', 'Unpaid', 'Partially Paid', 'Settled'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-[#EAE2D5] text-[#5C3826] font-bold'
                  : 'text-[#7D7065] hover:text-[#231F1C]'
              }`}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Debt Records Table */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EBE3D7] text-[#706458] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Party & Type</th>
                <th className="py-3.5 px-4">Recorded Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Original Debt</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-right">Remaining Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F5EFE6]">
              {filteredDebts.map(debt => {
                const isCustomer = debt.type === 'CUSTOMER';
                const hasBalance = debt.remainingBalance > 0;

                return (
                  <tr key={debt.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    {/* Party */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                            isCustomer ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isCustomer ? <User className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[#231F1C] block">
                            {debt.partyName}
                          </span>
                          <span className="text-[10px] text-[#8C7E72] uppercase font-semibold">
                            {isCustomer ? 'Customer Credit' : 'Supplier Invoice'}
                          </span>
                        </div>
                      </div>
                      {debt.notes && (
                        <p className="text-[11px] text-[#706458] mt-1 pl-8 italic">"{debt.notes}"</p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#706458]">
                      {new Date(debt.createdDate).toLocaleDateString()}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4">
                      {debt.dueDate ? (
                        <span className="font-mono text-xs text-[#231F1C] font-medium">
                          {debt.dueDate}
                        </span>
                      ) : (
                        <span className="text-[#9E9285]">No fixed date</span>
                      )}
                    </td>

                    {/* Original Debt */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#706458]">
                      {formatCurrency(debt.totalDebt)}
                    </td>

                    {/* Amount Paid */}
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      {formatCurrency(debt.amountPaid)}
                    </td>

                    {/* Remaining */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm tabular-nums">
                      <span className={hasBalance ? 'text-rose-700' : 'text-emerald-700'}>
                        {formatCurrency(debt.remainingBalance)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          debt.status === 'Settled'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : debt.status === 'Partially Paid'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {debt.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {hasBalance ? (
                        <button
                          onClick={() => handleOpenPayment(debt)}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#5C3826] hover:bg-[#482B1D] rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          {isCustomer ? 'Collect Payment' : 'Pay Supplier'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#8C7E72] font-medium">Fully Paid</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredDebts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#8C7E72]">
                    No debt records found matching your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Debt Modal */}
      {isNewDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#231F1C]">Add Debt Record</h3>
                  <p className="text-xs text-[#8C7E72]">Record supplier liability or customer credit entry.</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewDebtModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7E72] hover:bg-[#F2ECE3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                  Debt Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('SUPPLIER')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      newType === 'SUPPLIER'
                        ? 'bg-[#5C3826] text-white border-[#5C3826]'
                        : 'bg-[#FAF7F2] text-[#4A433D] border-[#E2D9CC]'
                    }`}
                  >
                    Supplier Debt (Payable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('CUSTOMER')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                      newType === 'CUSTOMER'
                        ? 'bg-[#5C3826] text-white border-[#5C3826]'
                        : 'bg-[#FAF7F2] text-[#4A433D] border-[#E2D9CC]'
                    }`}
                  >
                    Customer Debt (Receivable)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                  Party Name (Supplier or Customer) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Khaleej Food Dist. or Tariq"
                  value={newPartyName}
                  onChange={e => setNewPartyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                    Debt Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2D9CC] rounded-xl text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #203 for rice shipment"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#F0E9DF] flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewDebtModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-[#5C3826] bg-[#FAF5EE] border border-[#E2D9CC] rounded-xl hover:bg-[#F2ECE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#5C3826] hover:bg-[#482B1D] rounded-xl shadow-xs"
                >
                  Record Debt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <RecordDebtPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        debtRecord={paymentTarget}
      />
    </div>
  );
};
