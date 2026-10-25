import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Customer, DebtRecord } from '../types';
import { RecordDebtPaymentModal } from '../components/modals/RecordDebtPaymentModal';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  CreditCard,
  X,
  ShoppingBag,
  DollarSign
} from 'lucide-react';

export const CustomerInfoPage: React.FC = () => {
  const { customers, sales, debts, addCustomer, updateCustomer, deleteCustomer, formatCurrency } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [debtRecordToPay, setDebtRecordToPay] = useState<DebtRecord | null>(null);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingDebt, 0);

  const handleOpenAdd = () => {
    setCustomerToEdit(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setCustomerToEdit(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setNotes(c.notes || '');
    setIsAddEditModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined
      });
      if (selectedCustomer?.id === customerToEdit.id) {
        setSelectedCustomer({
          ...selectedCustomer,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined
        });
      }
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleOpenPayment = (customer: Customer) => {
    // Find customer's active debt record or create a virtual reference
    const activeDebt = debts.find(d => d.type === 'CUSTOMER' && d.customerId === customer.id && d.remainingBalance > 0);
    if (activeDebt) {
      setDebtRecordToPay(activeDebt);
      setIsPaymentModalOpen(true);
    } else if (customer.outstandingDebt > 0) {
      // Find any debt or match by partyName
      const altDebt = debts.find(d => d.type === 'CUSTOMER' && d.partyName === customer.name && d.remainingBalance > 0);
      if (altDebt) {
        setDebtRecordToPay(altDebt);
        setIsPaymentModalOpen(true);
      }
    }
  };

  // Customer transactions history
  const customerSales = selectedCustomer
    ? sales.filter(s => s.customerId === selectedCustomer.id || s.customerName === selectedCustomer.name)
    : [];

  const customerDebts = selectedCustomer
    ? debts.filter(d => d.type === 'CUSTOMER' && (d.customerId === selectedCustomer.id || d.partyName === selectedCustomer.name))
    : [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#231F1C] tracking-tight">
            Customer Directory & Accounts
          </h1>
          <p className="text-xs md:text-sm text-[#7D7065] mt-1">
            Maintain customer contact details, purchase frequency, and track individual credit balances.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#5C3826] hover:bg-[#482B1D] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Total Registered Customers
          </span>
          <p className="text-2xl font-bold font-mono text-[#231F1C] mt-1 tabular-nums">
            {customers.length}
          </p>
          <span className="text-[11px] text-[#706458]">Active directory entries</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Total Outstanding Debts
          </span>
          <p className="text-2xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            {formatCurrency(totalOutstanding)}
          </p>
          <span className="text-[11px] text-[#706458]">Cumulative customer credit owed</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-xs">
          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wider">
            Customers with Credit Balance
          </span>
          <p className="text-2xl font-bold font-mono text-[#5C3826] mt-1 tabular-nums">
            {customers.filter(c => c.outstandingDebt > 0).length}
          </p>
          <span className="text-[11px] text-[#706458]">Accounts awaiting settlement</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#EBE3D7] shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9285]" />
          <input
            type="text"
            placeholder="Search by customer name, phone, email, address..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
          />
        </div>
        <span className="text-xs text-[#8C7E72] hidden sm:block">
          Showing {filteredCustomers.length} of {customers.length} customers
        </span>
      </div>

      {/* Main Customers List */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EBE3D7] text-[#706458] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Phone & Email</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4 text-right">Total Purchases</th>
                <th className="py-3.5 px-4 text-right">Outstanding Debt</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F5EFE6]">
              {filteredCustomers.map(c => {
                const hasDebt = c.outstandingDebt > 0;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-[#FAF7F2]/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedCustomer(c)}
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sm text-[#231F1C] block hover:text-[#5C3826]">
                        {c.name}
                      </span>
                      {c.notes && (
                        <span className="text-[11px] text-[#8C7E72] line-clamp-1 italic">
                          "{c.notes}"
                        </span>
                      )}
                    </td>

                    {/* Phone & Email */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs text-[#231F1C] font-semibold">{c.phone}</div>
                      {c.email && <div className="text-[11px] text-[#8C7E72]">{c.email}</div>}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-[#5A524A]">
                      {c.address || '—'}
                    </td>

                    {/* Orders count */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[#231F1C]">
                      {c.orderCount}
                    </td>

                    {/* Total Purchases */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#231F1C] tabular-nums">
                      {formatCurrency(c.totalPurchases)}
                    </td>

                    {/* Outstanding Debt */}
                    <td className="py-3.5 px-4 text-right">
                      {hasDebt ? (
                        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 tabular-nums">
                          {formatCurrency(c.outstandingDebt)}
                        </span>
                      ) : (
                        <span className="font-mono text-emerald-700 text-[11px]">Settled ($0.00)</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {hasDebt && (
                          <button
                            onClick={() => handleOpenPayment(c)}
                            title="Collect payment on debt"
                            className="px-2 py-1 text-[11px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Collect Debt
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Customer"
                          className="p-1.5 text-[#706458] hover:bg-[#F2ECE3] rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCustomer(c.id)}
                          title="Delete Customer"
                          className="p-1.5 text-[#9E9285] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#8C7E72]">
                    No customers found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Side Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-lg h-[92vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#F0E9DF] bg-[#FAF7F2] flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAE2D5] text-[#5C3826] text-[11px] font-bold mb-1">
                  Customer Profile
                </div>
                <h3 className="text-xl font-bold text-[#231F1C]">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#706458] mt-0.5">{selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7E72] hover:bg-[#F2ECE3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Financial snapshot */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FAF6F0] border border-[#EAE0D2] rounded-2xl">
                <div>
                  <span className="text-[11px] font-semibold text-[#8C7E72]">Outstanding Balance</span>
                  <p className="text-xl font-bold font-mono text-rose-700 mt-0.5">
                    {formatCurrency(selectedCustomer.outstandingDebt)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8C7E72]">Total Spent to Date</span>
                  <p className="text-xl font-bold font-mono text-[#231F1C] mt-0.5">
                    {formatCurrency(selectedCustomer.totalPurchases)}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#5C3826] uppercase tracking-wider text-[11px]">
                  Contact & Details
                </h4>
                <div className="p-3 bg-[#FAF7F2] rounded-xl space-y-1.5 text-[#4A433D]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8C7E72]" />
                    <span className="font-mono">{selectedCustomer.phone}</span>
                  </div>
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#8C7E72]" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#8C7E72]" />
                      <span>{selectedCustomer.address}</span>
                    </div>
                  )}
                  {selectedCustomer.notes && (
                    <p className="italic text-[11px] text-[#706458] pt-1 border-t border-[#EAE0D2]">
                      "{selectedCustomer.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Purchase History */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#5C3826] uppercase tracking-wider text-[11px]">
                  Purchase Invoices ({customerSales.length})
                </h4>
                <div className="divide-y divide-[#F5EFE6] border border-[#EBE3D7] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {customerSales.length === 0 ? (
                    <div className="p-4 text-center text-[#8C7E72]">No sales recorded yet.</div>
                  ) : (
                    customerSales.map(s => (
                      <div key={s.id} className="p-2.5 hover:bg-[#FAF7F2] flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-[#231F1C] block">{s.invoiceNumber}</span>
                          <span className="text-[10px] text-[#8C7E72]">
                            {new Date(s.date).toLocaleDateString()} · {s.paymentMethod}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-[#231F1C]">
                            {formatCurrency(s.totalAmount)}
                          </span>
                          <span
                            className={`block text-[10px] font-semibold ${
                              s.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {s.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Debt Records */}
              {customerDebts.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-[#5C3826] uppercase tracking-wider text-[11px]">
                    Credit & Debt Accounts ({customerDebts.length})
                  </h4>
                  <div className="divide-y divide-[#F5EFE6] border border-[#EBE3D7] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {customerDebts.map(d => (
                      <div key={d.id} className="p-2.5 hover:bg-[#FAF7F2] flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-[#231F1C] block">
                            Balance: {formatCurrency(d.remainingBalance)}
                          </span>
                          <span className="text-[10px] text-[#8C7E72]">
                            Created: {new Date(d.createdDate).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setDebtRecordToPay(d);
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold bg-[#5C3826] text-white rounded-lg hover:bg-[#482B1D]"
                        >
                          Settle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer footer */}
            <div className="p-4 border-t border-[#F0E9DF] bg-[#FAF7F2] flex gap-2">
              <button
                onClick={() => handleOpenEdit(selectedCustomer)}
                className="flex-1 py-2 text-xs font-semibold text-[#5C3826] bg-white border border-[#E2D9CC] rounded-xl hover:bg-[#F2ECE3]"
              >
                Edit Customer Info
              </button>
              {selectedCustomer.outstandingDebt > 0 && (
                <button
                  onClick={() => handleOpenPayment(selectedCustomer)}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#5C3826] hover:bg-[#482B1D] rounded-xl shadow-xs"
                >
                  Collect Debt
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-[#E7DFD3] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E9DF] bg-[#FAF7F2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#231F1C]">
                    {customerToEdit ? 'Edit Customer' : 'Add New Customer'}
                  </h3>
                  <p className="text-xs text-[#8C7E72]">Save customer details for credit tracking and invoices.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7E72] hover:bg-[#F2ECE3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Al-Jamil"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +964 770 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                  Address / Neighborhood
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karrada, Baghdad"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wholesale client, family account"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-[#F0E9DF] flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-[#5C3826] bg-[#FAF5EE] border border-[#E2D9CC] rounded-xl hover:bg-[#F2ECE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#5C3826] hover:bg-[#482B1D] rounded-xl shadow-xs cursor-pointer"
                >
                  {customerToEdit ? 'Save Changes' : 'Create Customer'}
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
        debtRecord={debtRecordToPay}
      />
    </div>
  );
};
