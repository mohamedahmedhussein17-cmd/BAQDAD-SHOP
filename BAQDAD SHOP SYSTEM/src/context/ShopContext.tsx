import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Customer,
  Sale,
  DebtRecord,
  Expense,
  ShopSettings,
  StockMovement,
  PageId,
  PaymentMethod,
  PaymentStatus,
  SaleItem
} from '../types';
import {
  initialSettings,
  initialProducts,
  initialCustomers,
  initialSales,
  initialDebts,
  initialExpenses,
  initialStockMovements
} from '../data/initialData';
import {
  syncProductToSupabase,
  deleteProductFromSupabase,
  syncSaleToSupabase,
  syncCustomerToSupabase,
  deleteCustomerFromSupabase,
  syncDebtToSupabase,
  syncExpenseToSupabase,
  deleteExpenseFromSupabase,
  syncStockMovementToSupabase,
  pullAllFromSupabase,
  getStoredSupabaseConfig
} from '../lib/supabase';

interface ShopContextType {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  debts: DebtRecord[];
  expenses: Expense[];
  stockMovements: StockMovement[];
  settings: ShopSettings;
  activePage: PageId;
  setActivePage: (page: PageId) => void;

  // Modals & UI triggers
  isRecordSaleModalOpen: boolean;
  openRecordSaleModal: () => void;
  closeRecordSaleModal: () => void;
  activeReceiptSale: Sale | null;
  openReceiptModal: (sale: Sale) => void;
  closeReceiptModal: () => void;

  // Product & Inventory actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => boolean;
  restockProduct: (productId: string, quantityToAdd: number, costPrice?: number, note?: string, supplier?: string) => void;

  // Sales actions
  recordSale: (data: {
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    customerId?: string;
    customerName?: string;
    paymentMethod: PaymentMethod;
    amountPaid?: number;
    notes?: string;
  }) => { success: boolean; sale?: Sale; error?: string };

  // Customer actions
  addCustomer: (data: { name: string; phone: string; email?: string; address?: string; notes?: string }) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => boolean;

  // Debt actions
  recordDebtPayment: (debtId: string, amount: number, method: string, note?: string) => void;
  addDebtRecord: (data: {
    type: 'CUSTOMER' | 'SUPPLIER';
    partyName: string;
    customerId?: string;
    totalDebt: number;
    dueDate?: string;
    notes?: string;
  }) => DebtRecord;

  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Settings & Utilities
  updateSettings: (updates: Partial<ShopSettings>) => void;
  formatCurrency: (amount: number) => string;
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;

  // Aggregated analytics
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  totalSalesValue: number;
  totalRevenueCashCollected: number;
  totalCustomerDebt: number;
  totalSupplierDebt: number;
  totalOperatingExpenses: number;
  grossProfitTotal: number;
  netProfitTotal: number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'baqdad_shop_products_v1',
  SALES: 'baqdad_shop_sales_v1',
  CUSTOMERS: 'baqdad_shop_customers_v1',
  DEBTS: 'baqdad_shop_debts_v1',
  EXPENSES: 'baqdad_shop_expenses_v1',
  MOVEMENTS: 'baqdad_shop_movements_v1',
  SETTINGS: 'baqdad_shop_settings_v1',
  PAGE: 'baqdad_shop_active_page_v1'
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or use initial seed
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      return saved ? JSON.parse(saved) : initialSales;
    } catch {
      return initialSales;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [debts, setDebts] = useState<DebtRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
      return saved ? JSON.parse(saved) : initialDebts;
    } catch {
      return initialDebts;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : initialStockMovements;
    } catch {
      return initialStockMovements;
    }
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [activePage, setActivePage] = useState<PageId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAGE) as PageId;
      return saved || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  // Modal UI state
  const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAGE, activePage);
  }, [activePage]);

  // Auto-sync from Supabase on mount if credentials exist
  useEffect(() => {
    const config = getStoredSupabaseConfig();
    if (config.url && config.anonKey) {
      pullAllFromSupabase()
        .then(res => {
          if (res.success && res.data && res.data.products.length > 0) {
            setProducts(res.data.products);
            setSales(res.data.sales);
            setCustomers(res.data.customers);
            setDebts(res.data.debts);
            setExpenses(res.data.expenses);
            setStockMovements(res.data.stockMovements);
          }
        })
        .catch(err => console.warn('Supabase initial fetch skipped:', err));
    }
  }, []);

  // Modals
  const openRecordSaleModal = () => setIsRecordSaleModalOpen(true);
  const closeRecordSaleModal = () => setIsRecordSaleModalOpen(false);
  const openReceiptModal = (sale: Sale) => setActiveReceiptSale(sale);
  const closeReceiptModal = () => setActiveReceiptSale(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    const symbol = settings.currency || '$';
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Add Product
  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      lastRestockedAt: new Date().toISOString()
    };

    setProducts(prev => [newProduct, ...prev]);

    // Live sync to Supabase
    syncProductToSupabase(newProduct);

    // Add initial movement log if quantity > 0
    if (newProduct.quantity > 0) {
      const initialMovement: StockMovement = {
        id: `sm-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'INITIAL',
        quantityChanged: newProduct.quantity,
        previousQuantity: 0,
        newQuantity: newProduct.quantity,
        date: new Date().toISOString(),
        note: 'Initial catalog stock entry'
      };
      setStockMovements(prev => [initialMovement, ...prev]);
      syncStockMovementToSupabase(initialMovement);
    }

    return newProduct;
  };

  // Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, ...updates };

        // Check if quantity was manually adjusted
        if (updates.quantity !== undefined && updates.quantity !== p.quantity) {
          const diff = updates.quantity - p.quantity;
          const movement: StockMovement = {
            id: `sm-${Date.now()}`,
            productId: p.id,
            productName: updated.name,
            type: 'ADJUSTMENT',
            quantityChanged: diff,
            previousQuantity: p.quantity,
            newQuantity: updates.quantity,
            date: new Date().toISOString(),
            note: 'Manual inventory stock adjustment'
          };
          setStockMovements(m => [movement, ...m]);
          syncStockMovementToSupabase(movement);
        }

        syncProductToSupabase(updated);
        return updated;
      })
    );
  };

  // Delete Product
  const deleteProduct = (id: string): boolean => {
    setProducts(prev => prev.filter(p => p.id !== id));
    deleteProductFromSupabase(id);
    return true;
  };

  // Restock Product
  const restockProduct = (
    productId: string,
    quantityToAdd: number,
    costPrice?: number,
    note?: string,
    supplier?: string
  ) => {
    if (quantityToAdd <= 0) return;

    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p;
        const prevQty = p.quantity;
        const newQty = prevQty + quantityToAdd;

        const updated: Product = {
          ...p,
          quantity: newQty,
          lastRestockedAt: new Date().toISOString()
        };
        if (costPrice !== undefined && costPrice > 0) {
          updated.costPrice = costPrice;
        }
        if (supplier) {
          updated.supplier = supplier;
        }

        // Add movement log
        const movement: StockMovement = {
          id: `sm-${Date.now()}`,
          productId: p.id,
          productName: p.name,
          type: 'RESTOCK',
          quantityChanged: quantityToAdd,
          previousQuantity: prevQty,
          newQuantity: newQty,
          date: new Date().toISOString(),
          note: note || (supplier ? `Stock received from ${supplier}` : 'Stock replenishment')
        };
        setStockMovements(m => [movement, ...m]);
        syncStockMovementToSupabase(movement);
        syncProductToSupabase(updated);

        return updated;
      })
    );
  };

  // Record Sale and automatically deduct stock
  const recordSale = (data: {
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    customerId?: string;
    customerName?: string;
    paymentMethod: PaymentMethod;
    amountPaid?: number;
    notes?: string;
  }): { success: boolean; sale?: Sale; error?: string } => {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'No items in cart' };
    }

    // Verify stock availability
    for (const item of data.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product ID ${item.productId} not found` };
      }
      if (prod.quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Available: ${prod.quantity}, Requested: ${item.quantity}`
        };
      }
    }

    // Build SaleItems and calculate sums
    let totalAmount = 0;
    let totalCost = 0;
    const saleItems: SaleItem[] = [];

    for (const item of data.items) {
      const prod = products.find(p => p.id === item.productId)!;
      const subtotal = item.quantity * item.unitPrice;
      const costSubtotal = item.quantity * prod.costPrice;
      totalAmount += subtotal;
      totalCost += costSubtotal;

      saleItems.push({
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: prod.costPrice,
        subtotal
      });
    }

    const netProfit = totalAmount - totalCost;
    const isDebtPayment = data.paymentMethod === 'Customer Debt';

    let amountPaid = data.amountPaid !== undefined ? data.amountPaid : (isDebtPayment ? 0 : totalAmount);
    if (amountPaid > totalAmount) amountPaid = totalAmount;
    if (amountPaid < 0) amountPaid = 0;

    const debtAmount = totalAmount - amountPaid;
    let paymentStatus: PaymentStatus = 'Paid';
    if (debtAmount > 0 && amountPaid === 0) {
      paymentStatus = 'Credit / Debt';
    } else if (debtAmount > 0) {
      paymentStatus = 'Partially Paid';
    }

    const nextInvoiceSeq = 1000 + sales.length + 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${nextInvoiceSeq}`;
    const saleId = `sale-${Date.now()}`;
    const saleDate = new Date().toISOString();

    const newSale: Sale = {
      id: saleId,
      invoiceNumber,
      date: saleDate,
      items: saleItems,
      totalAmount,
      totalCost,
      netProfit,
      customerId: data.customerId,
      customerName: data.customerName || (data.customerId ? customers.find(c => c.id === data.customerId)?.name : 'Walk-in Customer'),
      customerPhone: data.customerId ? customers.find(c => c.id === data.customerId)?.phone : undefined,
      paymentMethod: data.paymentMethod,
      paymentStatus,
      amountPaid,
      debtAmount,
      notes: data.notes
    };

    // 1. Deduct product quantities & log movements
    const movementsToAdd: StockMovement[] = [];
    setProducts(prev =>
      prev.map(p => {
        const soldItem = data.items.find(it => it.productId === p.id);
        if (!soldItem) return p;

        const prevQty = p.quantity;
        const newQty = Math.max(0, prevQty - soldItem.quantity);

        movementsToAdd.push({
          id: `sm-${Date.now()}-${p.id}`,
          productId: p.id,
          productName: p.name,
          type: 'SALE',
          quantityChanged: -soldItem.quantity,
          previousQuantity: prevQty,
          newQuantity: newQty,
          date: saleDate,
          note: `Sold on invoice ${invoiceNumber}`,
          referenceId: invoiceNumber
        });

        return {
          ...p,
          quantity: newQty
        };
      })
    );

    if (movementsToAdd.length > 0) {
      setStockMovements(prev => [...movementsToAdd, ...prev]);
      movementsToAdd.forEach(m => syncStockMovementToSupabase(m));
    }

    // 2. Add Sale record & sync to Supabase
    setSales(prev => [newSale, ...prev]);
    syncSaleToSupabase(newSale);

    // 3. If there is debt, create or update DebtRecord and Customer debt
    if (debtAmount > 0 && data.customerId) {
      const customer = customers.find(c => c.id === data.customerId);
      const partyName = customer ? customer.name : (data.customerName || 'Customer');

      const newDebt: DebtRecord = {
        id: `debt-${Date.now()}`,
        type: 'CUSTOMER',
        partyName,
        customerId: data.customerId,
        referenceSaleId: saleId,
        totalDebt: debtAmount,
        amountPaid: 0,
        remainingBalance: debtAmount,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days due
        createdDate: saleDate,
        status: 'Unpaid',
        notes: `Credit purchase on ${invoiceNumber}`,
        payments: []
      };

      setDebts(prev => [newDebt, ...prev]);
      syncDebtToSupabase(newDebt);

      // Update customer outstanding debt & order stats
      setCustomers(prev =>
        prev.map(c => {
          if (c.id !== data.customerId) return c;
          const updated = {
            ...c,
            outstandingDebt: c.outstandingDebt + debtAmount,
            totalPurchases: c.totalPurchases + totalAmount,
            orderCount: c.orderCount + 1
          };
          syncCustomerToSupabase(updated);
          return updated;
        })
      );
    } else if (data.customerId) {
      // Just update purchases and order count
      setCustomers(prev =>
        prev.map(c => {
          if (c.id !== data.customerId) return c;
          const updated = {
            ...c,
            totalPurchases: c.totalPurchases + totalAmount,
            orderCount: c.orderCount + 1
          };
          syncCustomerToSupabase(updated);
          return updated;
        })
      );
    }

    return { success: true, sale: newSale };
  };

  // Add Customer
  const addCustomer = (data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
  }): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      outstandingDebt: 0,
      totalPurchases: 0,
      orderCount: 0,
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    syncCustomerToSupabase(newCustomer);
    return newCustomer;
  };

  // Update Customer
  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };
        syncCustomerToSupabase(updated);
        return updated;
      })
    );
  };

  // Delete Customer
  const deleteCustomer = (id: string): boolean => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    deleteCustomerFromSupabase(id);
    return true;
  };

  // Record Debt Payment (Customer paying or Shop paying Supplier)
  const recordDebtPayment = (debtId: string, amount: number, method: string, note?: string) => {
    if (amount <= 0) return;

    setDebts(prev =>
      prev.map(d => {
        if (d.id !== debtId) return d;

        const actualPayAmount = Math.min(amount, d.remainingBalance);
        const newPaid = d.amountPaid + actualPayAmount;
        const newRemaining = Math.max(0, d.totalDebt - newPaid);
        const newStatus: 'Settled' | 'Partially Paid' = newRemaining === 0 ? 'Settled' : 'Partially Paid';

        const paymentItem = {
          id: `pay-${Date.now()}`,
          amount: actualPayAmount,
          date: new Date().toISOString(),
          method,
          note: note || 'Debt settlement payment'
        };

        // If this is a customer debt, also reduce the customer's overall outstandingDebt
        if (d.type === 'CUSTOMER' && d.customerId) {
          setCustomers(custs =>
            custs.map(c => {
              if (c.id !== d.customerId) return c;
              const updatedCust = {
                ...c,
                outstandingDebt: Math.max(0, c.outstandingDebt - actualPayAmount)
              };
              syncCustomerToSupabase(updatedCust);
              return updatedCust;
            })
          );
        }

        const updatedDebt = {
          ...d,
          amountPaid: newPaid,
          remainingBalance: newRemaining,
          status: newStatus,
          payments: [paymentItem, ...d.payments]
        };
        syncDebtToSupabase(updatedDebt);
        return updatedDebt;
      })
    );
  };

  // Add Debt Record
  const addDebtRecord = (data: {
    type: 'CUSTOMER' | 'SUPPLIER';
    partyName: string;
    customerId?: string;
    totalDebt: number;
    dueDate?: string;
    notes?: string;
  }): DebtRecord => {
    const newDebt: DebtRecord = {
      ...data,
      id: `debt-${Date.now()}`,
      amountPaid: 0,
      remainingBalance: data.totalDebt,
      createdDate: new Date().toISOString(),
      status: 'Unpaid',
      payments: []
    };

    setDebts(prev => [newDebt, ...prev]);
    syncDebtToSupabase(newDebt);

    // If it's a customer debt linked to an existing customer, add to their balance
    if (data.type === 'CUSTOMER' && data.customerId) {
      setCustomers(prev =>
        prev.map(c => {
          if (c.id !== data.customerId) return c;
          const updatedCust = {
            ...c,
            outstandingDebt: c.outstandingDebt + data.totalDebt
          };
          syncCustomerToSupabase(updatedCust);
          return updatedCust;
        })
      );
    }

    return newDebt;
  };

  // Expenses
  const addExpense = (expenseData: Omit<Expense, 'id'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExpense, ...prev]);
    syncExpenseToSupabase(newExpense);
    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(e => {
        if (e.id !== id) return e;
        const updated = { ...e, ...updates };
        syncExpenseToSupabase(updated);
        return updated;
      })
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    deleteExpenseFromSupabase(id);
  };

  // Settings
  const updateSettings = (updates: Partial<ShopSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setProducts(initialProducts);
    setSales(initialSales);
    setCustomers(initialCustomers);
    setDebts(initialDebts);
    setExpenses(initialExpenses);
    setStockMovements(initialStockMovements);
    setSettings(initialSettings);
    setActivePage('dashboard');
  };

  // Clear all data
  const clearAllData = () => {
    setProducts([]);
    setSales([]);
    setCustomers([]);
    setDebts([]);
    setExpenses([]);
    setStockMovements([]);
    setActivePage('dashboard');
  };

  // Export JSON backup
  const exportBackupJSON = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      products,
      sales,
      customers,
      debts,
      expenses,
      stockMovements
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `baqdad-shop-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) setProducts(data.products);
      if (data.sales && Array.isArray(data.sales)) setSales(data.sales);
      if (data.customers && Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.debts && Array.isArray(data.debts)) setDebts(data.debts);
      if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.stockMovements && Array.isArray(data.stockMovements)) setStockMovements(data.stockMovements);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  // Computed Aggregations
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= p.lowStockThreshold);
  const outOfStockProducts = products.filter(p => p.quantity === 0);

  const totalSalesValue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  // Revenue is actual collected payments from sales + collected debt payments from customers
  const collectedFromSales = sales.reduce((sum, s) => sum + s.amountPaid, 0);
  const collectedFromDebtPayments = debts
    .filter(d => d.type === 'CUSTOMER')
    .reduce((sum, d) => sum + d.amountPaid, 0);
  const totalRevenueCashCollected = collectedFromSales + collectedFromDebtPayments;

  const totalCustomerDebt = debts
    .filter(d => d.type === 'CUSTOMER')
    .reduce((sum, d) => sum + d.remainingBalance, 0);

  const totalSupplierDebt = debts
    .filter(d => d.type === 'SUPPLIER')
    .reduce((sum, d) => sum + d.remainingBalance, 0);

  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const grossProfitTotal = sales.reduce((sum, s) => sum + s.netProfit, 0);
  const netProfitTotal = grossProfitTotal - totalOperatingExpenses;

  return (
    <ShopContext.Provider
      value={{
        products,
        sales,
        customers,
        debts,
        expenses,
        stockMovements,
        settings,
        activePage,
        setActivePage,
        isRecordSaleModalOpen,
        openRecordSaleModal,
        closeRecordSaleModal,
        activeReceiptSale,
        openReceiptModal,
        closeReceiptModal,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        recordSale,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        recordDebtPayment,
        addDebtRecord,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        formatCurrency,
        resetToDemoData,
        clearAllData,
        exportBackupJSON,
        importBackupJSON,
        lowStockProducts,
        outOfStockProducts,
        totalSalesValue,
        totalRevenueCashCollected,
        totalCustomerDebt,
        totalSupplierDebt,
        totalOperatingExpenses,
        grossProfitTotal,
        netProfitTotal
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
