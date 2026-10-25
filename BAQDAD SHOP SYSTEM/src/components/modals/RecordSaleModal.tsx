import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { PaymentMethod, Product } from '../../types';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Search,
  ShoppingCart,
  User,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Receipt
} from 'lucide-react';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  maxStock: number;
  sku: string;
}

export const RecordSaleModal: React.FC = () => {
  const {
    products,
    customers,
    recordSale,
    isRecordSaleModalOpen,
    closeRecordSaleModal,
    openReceiptModal,
    formatCurrency,
    settings
  } = useShop();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [customPaidAmount, setCustomPaidAmount] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 12);
    const q = productSearch.toLowerCase();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Cart Calculations
  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedProfit = totalAmount - totalCost;

  // Determine amount paid
  const isDebtMode = paymentMethod === 'Customer Debt';
  const parsedPaidAmount = customPaidAmount !== '' ? parseFloat(customPaidAmount) || 0 : (isDebtMode ? 0 : totalAmount);
  const debtBalance = Math.max(0, totalAmount - parsedPaidAmount);

  const addToCart = (product: Product) => {
    setErrorMsg(null);
    if (product.quantity <= 0) {
      setErrorMsg(`"${product.name}" is currently out of stock.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          setErrorMsg(`Cannot add more than ${product.quantity} units of "${product.name}".`);
          return prev;
        }
        return prev.map(item =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitPrice: product.sellingPrice,
            costPrice: product.costPrice,
            maxStock: product.quantity,
            sku: product.sku
          }
        ];
      }
    });
  };

  const updateQuantity = (productId: string, newQty: number) => {
    setErrorMsg(null);
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.productId !== productId) return item;
        if (newQty > item.maxStock) {
          setErrorMsg(`Only ${item.maxStock} units available for ${item.name}`);
          return { ...item, quantity: item.maxStock };
        }
        return { ...item, quantity: newQty };
      })
    );
  };

  const updatePrice = (productId: string, price: number) => {
    setCart(prev =>
      prev.map(item => (item.productId === productId ? { ...item, unitPrice: Math.max(0, price) } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleCheckout = () => {
    setErrorMsg(null);
    if (cart.length === 0) {
      setErrorMsg('Please add at least one product to the sale.');
      return;
    }

    if (isDebtMode && !selectedCustomerId) {
      setErrorMsg('A customer must be selected to record a credit / debt sale.');
      return;
    }

    const result = recordSale({
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      })),
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer ? selectedCustomer.name : undefined,
      paymentMethod,
      amountPaid: isDebtMode && customPaidAmount !== '' ? parseFloat(customPaidAmount) : (isDebtMode ? 0 : totalAmount),
      notes: saleNotes.trim() || undefined
    });

    if (result.success && result.sale) {
      // Clear state and close
      setCart([]);
      setSelectedCustomerId('');
      setCustomPaidAmount('');
      setSaleNotes('');
      closeRecordSaleModal();
      openReceiptModal(result.sale);
    } else {
      setErrorMsg(result.error || 'Failed to complete sale');
    }
  };

  if (!isRecordSaleModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#FAF7F2] border border-[#E7DFD3] rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE3D7] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5C3826] text-white flex items-center justify-center font-bold">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2D2723]">Record a Sale (Point of Sale)</h2>
              <p className="text-xs text-[#8C7E72]">
                Select items, choose payment or credit terms, and update stock automatically.
              </p>
            </div>
          </div>
          <button
            onClick={closeRecordSaleModal}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#8C7E72] hover:bg-[#F2ECE3] hover:text-[#2D2723] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Side: Product Selector (7 cols) */}
          <div className="lg:col-span-7 p-6 border-r border-[#EBE3D7] flex flex-col overflow-y-auto bg-[#FAF7F2]">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E9285]" />
              <input
                type="text"
                placeholder="Search products by name, category, or SKU..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2D9CC] rounded-xl text-sm placeholder:text-[#9E9285] focus:outline-hidden focus:ring-2 focus:ring-[#5C3826] transition-all"
              />
              {productSearch && (
                <button
                  onClick={() => setProductSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9E9285] hover:text-[#2D2723]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map(product => {
                  const isOutOfStock = product.quantity <= 0;
                  const isLow = product.quantity > 0 && product.quantity <= product.lowStockThreshold;
                  const cartItem = cart.find(c => c.productId === product.id);

                  return (
                    <button
                      key={product.id}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                        isOutOfStock
                          ? 'bg-[#F2ECE3]/60 border-[#E5DDD2] opacity-60 cursor-not-allowed'
                          : cartItem
                          ? 'bg-white border-[#5C3826] ring-1 ring-[#5C3826] shadow-xs'
                          : 'bg-white border-[#E8DFD3] hover:border-[#5C3826]/40 hover:shadow-xs'
                      }`}
                    >
                      {cartItem && (
                        <span className="absolute -top-2 -right-2 bg-[#5C3826] text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
                          {cartItem.quantity}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-semibold text-[#8C7E72] uppercase tracking-wide truncate">
                            {product.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-700'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {isOutOfStock ? 'Out' : `${product.quantity} left`}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#2D2723] line-clamp-2 leading-snug">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#F5EFE6]">
                        <span className="text-xs font-bold text-[#5C3826] font-mono tabular-nums">
                          {formatCurrency(product.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-[#8C7E72]">
                          Cost: {formatCurrency(product.costPrice)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-sm text-[#8C7E72]">
                  No products found matching "{productSearch}".
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Cart, Customer & Checkout (5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-white overflow-y-auto">
            <div>
              {/* Customer Selector */}
              <div className="mb-4 pb-4 border-b border-[#F0E9DF]">
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
                  Customer (Optional for Cash, Required for Debt)
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-[#2D2723] focus:outline-hidden focus:ring-2 focus:ring-[#5C3826]"
                  >
                    <option value="">Walk-in Customer (General Public)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) {c.outstandingDebt > 0 ? `· Debt: ${formatCurrency(c.outstandingDebt)}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCustomer && (
                  <div className="mt-2 p-2.5 bg-[#FAF5EE] rounded-xl border border-[#EAE0D2] text-xs flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-[#2D2723]">{selectedCustomer.name}</span>
                      <span className="text-[#8C7E72] ml-2 text-[11px]">{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.outstandingDebt > 0 && (
                      <span className="text-rose-700 font-semibold font-mono text-[11px]">
                        Owes: {formatCurrency(selectedCustomer.outstandingDebt)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#5C3826] uppercase tracking-wider">
                    Selected Items ({totalItemsCount})
                  </span>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-[#F5EFE6] border border-[#EBE3D7] rounded-xl bg-[#FDFBF9] p-2">
                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#8C7E72]">
                      <ShoppingCart className="w-6 h-6 mx-auto mb-1 opacity-40 text-[#5C3826]" />
                      Cart is empty. Click products from the catalog to add.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.productId} className="py-2 flex items-center justify-between gap-2 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#2D2723] truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8C7E72]">
                            <span className="font-mono text-[#5C3826] font-semibold">
                              {formatCurrency(item.unitPrice)}
                            </span>
                            <span>x {item.quantity}</span>
                            <span className="text-[#C2B7A8]">|</span>
                            <span className="font-mono font-bold text-[#2D2723]">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1 bg-white border border-[#E2D9CC] rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#706458] hover:bg-[#F2ECE3] rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#706458] hover:bg-[#F2ECE3] rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-[#9E9285] hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#5C3826] uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Cash', 'Card', 'Customer Debt'] as PaymentMethod[]).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === pm
                          ? 'bg-[#5C3826] text-white border-[#5C3826] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#4A433D] border-[#E2D9CC] hover:bg-[#F2ECE3]'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Partial / Debt Amount inputs */}
              {isDebtMode && (
                <div className="mb-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-900">Initial Down Payment (Optional):</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={customPaidAmount}
                      onChange={e => setCustomPaidAmount(e.target.value)}
                      className="w-24 px-2 py-1 text-right text-xs bg-white border border-amber-300 rounded font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/80">
                    <span className="text-amber-800">Remaining Balance to Customer Debt:</span>
                    <span className="font-mono font-bold text-rose-700">
                      {formatCurrency(debtBalance)}
                    </span>
                  </div>
                </div>
              )}

              {/* Sale Notes */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Order notes or reference (optional)..."
                  value={saleNotes}
                  onChange={e => setSaleNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-[#2D2723]"
                />
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Bottom Total & Checkout Action */}
            <div className="pt-3 border-t border-[#F0E9DF]">
              <div className="space-y-1.5 mb-3 text-xs">
                <div className="flex justify-between text-[#706458]">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[#706458]">
                  <span>Est. Gross Profit:</span>
                  <span className="font-mono tabular-nums text-emerald-700 font-medium">
                    +{formatCurrency(estimatedProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#2D2723] pt-1 border-t border-[#F0E9DF]">
                  <span>Total Due:</span>
                  <span className="font-mono text-lg text-[#5C3826]">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={closeRecordSaleModal}
                  className="py-2.5 px-4 text-xs font-semibold text-[#5C3826] bg-[#FAF5EE] border border-[#E2D9CC] rounded-xl hover:bg-[#F2ECE3] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    cart.length === 0
                      ? 'bg-[#B0A294] cursor-not-allowed'
                      : 'bg-[#5C3826] hover:bg-[#482B1D] active:scale-[0.98]'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Complete & Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
