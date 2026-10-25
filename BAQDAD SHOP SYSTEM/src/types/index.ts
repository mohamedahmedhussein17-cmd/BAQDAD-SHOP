export type PageId =
  | 'frontpage'
  | 'dashboard'
  | 'inventory'
  | 'sales'
  | 'customers'
  | 'debts'
  | 'customer-debts'
  | 'revenue'
  | 'expenses'
  | 'settings';

export interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  lowStockThreshold: number;
  sku: string;
  supplier?: string;
  createdAt: string;
  lastRestockedAt?: string;
}

export type StockMovementType = 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'INITIAL' | 'RETURN';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityChanged: number; // positive for addition, negative for reduction
  previousQuantity: number;
  newQuantity: number;
  date: string;
  note?: string;
  referenceId?: string; // e.g. sale invoice # or supplier order #
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer' | 'Customer Debt';
export type PaymentStatus = 'Paid' | 'Credit / Debt' | 'Partially Paid';

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  items: SaleItem[];
  totalAmount: number;
  totalCost: number;
  netProfit: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  debtAmount: number;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  outstandingDebt: number;
  totalPurchases: number;
  orderCount: number;
  createdAt: string;
  notes?: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  method: string;
  note?: string;
}

export interface DebtRecord {
  id: string;
  type: 'CUSTOMER' | 'SUPPLIER';
  partyName: string;
  customerId?: string;
  referenceSaleId?: string;
  totalDebt: number;
  amountPaid: number;
  remainingBalance: number;
  dueDate?: string;
  createdDate: string;
  status: 'Unpaid' | 'Partially Paid' | 'Settled';
  notes?: string;
  payments: DebtPayment[];
}

export type ExpenseCategory =
  | 'Rent'
  | 'Utilities'
  | 'Salaries'
  | 'Maintenance'
  | 'Transport'
  | 'Supplies'
  | 'Marketing'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  payee: string;
  paymentMethod: string;
  receiptNote?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  currency: string;
  phone: string;
  address: string;
  defaultLowStockThreshold: number;
  adminName: string;
  adminRole: string;
  adminEmail: string;
}
