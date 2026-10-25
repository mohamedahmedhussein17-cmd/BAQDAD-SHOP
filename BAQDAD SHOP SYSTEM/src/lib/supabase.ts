import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Sale, Customer, DebtRecord, Expense, StockMovement } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

const STORAGE_KEY = 'baqdad_supabase_config_v1';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load supabase config', e);
  }

  // Fallback to Vite env variables if provided
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: !!(envUrl && envKey),
    lastSyncedAt: undefined
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save supabase config', e);
  }
}

let cachedClient: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  const url = (customUrl || config.url || '').trim();
  const key = (customKey || config.anonKey || '').trim();

  if (!url || !key) return null;

  const keySignature = `${url}:${key}`;
  if (cachedClient && currentClientKey === keySignature) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentClientKey = keySignature;
    return cachedClient;
  } catch (e) {
    console.error('Error creating Supabase client:', e);
    return null;
  }
}

/**
 * Tests the connection to Supabase
 */
export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, key);
    // Ping by checking table or auth health
    const { error } = await testClient.from('products').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, but credentials are valid, Supabase returns a 42P01 error code
      if (error.code === '42P01' || error.message.includes('relation "products" does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables not created yet — run the SQL schema script in Supabase SQL editor)'
        };
      }
      return { success: false, message: `Supabase Error: ${error.message}` };
    }

    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to connect to Supabase' };
  }
}

/**
 * SQL Schema Script for Supabase SQL Editor
 */
export function getSupabaseSQLSchema(): string {
  return `-- ==========================================
-- BAQDAD SHOP MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==========================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  selling_price NUMERIC(12,2) NOT NULL,
  cost_price NUMERIC(12,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  sku TEXT NOT NULL,
  supplier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_restocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  outstanding_debt NUMERIC(12,2) DEFAULT 0,
  total_purchases NUMERIC(12,2) DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 3. Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(12,2) NOT NULL,
  total_cost NUMERIC(12,2) NOT NULL,
  net_profit NUMERIC(12,2) NOT NULL,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL,
  debt_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT
);

-- 4. Debts Table
CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'CUSTOMER' or 'SUPPLIER'
  party_name TEXT NOT NULL,
  customer_id TEXT,
  reference_sale_id TEXT,
  total_debt NUMERIC(12,2) NOT NULL,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  remaining_balance NUMERIC(12,2) NOT NULL,
  due_date TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL,
  notes TEXT,
  payments JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 5. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  payee TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  receipt_note TEXT
);

-- 6. Stock Movements Audit Table
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity_changed INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  note TEXT,
  reference_id TEXT
);

-- Enable Row Level Security (RLS) with open anon read/write for shop app
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to debts" ON debts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
`;
}

/**
 * Push all application state to Supabase
 */
export async function pushAllToSupabase(data: {
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  debts: DebtRecord[];
  expenses: Expense[];
  stockMovements: StockMovement[];
}): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    // 1. Sync Products
    if (data.products.length > 0) {
      const dbProducts = data.products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        selling_price: p.sellingPrice,
        cost_price: p.costPrice,
        quantity: p.quantity,
        low_stock_threshold: p.lowStockThreshold,
        sku: p.sku,
        supplier: p.supplier || null,
        created_at: p.createdAt,
        last_restocked_at: p.lastRestockedAt || null
      }));
      const { error: pErr } = await client.from('products').upsert(dbProducts, { onConflict: 'id' });
      if (pErr) throw new Error(`Products error: ${pErr.message}`);
    }

    // 2. Sync Customers
    if (data.customers.length > 0) {
      const dbCustomers = data.customers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || null,
        address: c.address || null,
        outstanding_debt: c.outstandingDebt,
        total_purchases: c.totalPurchases,
        order_count: c.orderCount,
        created_at: c.createdAt,
        notes: c.notes || null
      }));
      const { error: cErr } = await client.from('customers').upsert(dbCustomers, { onConflict: 'id' });
      if (cErr) throw new Error(`Customers error: ${cErr.message}`);
    }

    // 3. Sync Sales
    if (data.sales.length > 0) {
      const dbSales = data.sales.map(s => ({
        id: s.id,
        invoice_number: s.invoiceNumber,
        date: s.date,
        items: s.items,
        total_amount: s.totalAmount,
        total_cost: s.totalCost,
        net_profit: s.netProfit,
        customer_id: s.customerId || null,
        customer_name: s.customerName || null,
        customer_phone: s.customerPhone || null,
        payment_method: s.paymentMethod,
        payment_status: s.paymentStatus,
        amount_paid: s.amountPaid,
        debt_amount: s.debtAmount,
        notes: s.notes || null
      }));
      const { error: sErr } = await client.from('sales').upsert(dbSales, { onConflict: 'id' });
      if (sErr) throw new Error(`Sales error: ${sErr.message}`);
    }

    // 4. Sync Debts
    if (data.debts.length > 0) {
      const dbDebts = data.debts.map(d => ({
        id: d.id,
        type: d.type,
        party_name: d.partyName,
        customer_id: d.customerId || null,
        reference_sale_id: d.referenceSaleId || null,
        total_debt: d.totalDebt,
        amount_paid: d.amountPaid,
        remaining_balance: d.remainingBalance,
        due_date: d.dueDate || null,
        created_date: d.createdDate,
        status: d.status,
        notes: d.notes || null,
        payments: d.payments
      }));
      const { error: dErr } = await client.from('debts').upsert(dbDebts, { onConflict: 'id' });
      if (dErr) throw new Error(`Debts error: ${dErr.message}`);
    }

    // 5. Sync Expenses
    if (data.expenses.length > 0) {
      const dbExpenses = data.expenses.map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        amount: e.amount,
        date: e.date,
        payee: e.payee,
        payment_method: e.paymentMethod,
        receipt_note: e.receiptNote || null
      }));
      const { error: eErr } = await client.from('expenses').upsert(dbExpenses, { onConflict: 'id' });
      if (eErr) throw new Error(`Expenses error: ${eErr.message}`);
    }

    // 6. Sync Stock Movements
    if (data.stockMovements.length > 0) {
      const dbMovements = data.stockMovements.map(m => ({
        id: m.id,
        product_id: m.productId,
        product_name: m.productName,
        type: m.type,
        quantity_changed: m.quantityChanged,
        previous_quantity: m.previousQuantity,
        new_quantity: m.newQuantity,
        date: m.date,
        note: m.note || null,
        reference_id: m.referenceId || null
      }));
      const { error: mErr } = await client.from('stock_movements').upsert(dbMovements, { onConflict: 'id' });
      if (mErr) throw new Error(`Movements error: ${mErr.message}`);
    }

    // Update last sync time
    const config = getStoredSupabaseConfig();
    saveStoredSupabaseConfig({
      ...config,
      isConnected: true,
      lastSyncedAt: new Date().toISOString()
    });

    return { success: true, message: 'All store data successfully synced to Supabase!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Sync failed.' };
  }
}

/**
 * Fetch records from Supabase into the local app
 */
export async function pullAllFromSupabase(): Promise<{
  success: boolean;
  message: string;
  data?: {
    products: Product[];
    sales: Sale[];
    customers: Customer[];
    debts: DebtRecord[];
    expenses: Expense[];
    stockMovements: StockMovement[];
  };
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    const { data: dbProducts, error: pErr } = await client.from('products').select('*');
    if (pErr) throw pErr;

    const { data: dbCustomers, error: cErr } = await client.from('customers').select('*');
    if (cErr) throw cErr;

    const { data: dbSales, error: sErr } = await client.from('sales').select('*');
    if (sErr) throw sErr;

    const { data: dbDebts, error: dErr } = await client.from('debts').select('*');
    if (dErr) throw dErr;

    const { data: dbExpenses, error: eErr } = await client.from('expenses').select('*');
    if (eErr) throw eErr;

    const { data: dbMovements, error: mErr } = await client.from('stock_movements').select('*');
    if (mErr) throw mErr;

    const products: Product[] = (dbProducts || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      sellingPrice: Number(p.selling_price),
      costPrice: Number(p.cost_price),
      quantity: Number(p.quantity),
      lowStockThreshold: Number(p.low_stock_threshold || 5),
      sku: p.sku,
      supplier: p.supplier,
      createdAt: p.created_at,
      lastRestockedAt: p.last_restocked_at
    }));

    const customers: Customer[] = (dbCustomers || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      outstandingDebt: Number(c.outstanding_debt || 0),
      totalPurchases: Number(c.total_purchases || 0),
      orderCount: Number(c.order_count || 0),
      createdAt: c.created_at,
      notes: c.notes
    }));

    const sales: Sale[] = (dbSales || []).map((s: any) => ({
      id: s.id,
      invoiceNumber: s.invoice_number,
      date: s.date,
      items: s.items || [],
      totalAmount: Number(s.total_amount),
      totalCost: Number(s.total_cost),
      netProfit: Number(s.net_profit),
      customerId: s.customer_id,
      customerName: s.customer_name,
      customerPhone: s.customer_phone,
      paymentMethod: s.payment_method,
      paymentStatus: s.payment_status,
      amountPaid: Number(s.amount_paid),
      debtAmount: Number(s.debt_amount || 0),
      notes: s.notes
    }));

    const debts: DebtRecord[] = (dbDebts || []).map((d: any) => ({
      id: d.id,
      type: d.type,
      partyName: d.party_name,
      customerId: d.customer_id,
      referenceSaleId: d.reference_sale_id,
      totalDebt: Number(d.total_debt),
      amountPaid: Number(d.amount_paid),
      remainingBalance: Number(d.remaining_balance),
      dueDate: d.due_date,
      createdDate: d.created_date,
      status: d.status,
      notes: d.notes,
      payments: d.payments || []
    }));

    const expenses: Expense[] = (dbExpenses || []).map((e: any) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      amount: Number(e.amount),
      date: e.date,
      payee: e.payee,
      paymentMethod: e.payment_method,
      receiptNote: e.receipt_note
    }));

    const stockMovements: StockMovement[] = (dbMovements || []).map((m: any) => ({
      id: m.id,
      productId: m.product_id,
      productName: m.product_name,
      type: m.type,
      quantityChanged: Number(m.quantity_changed),
      previousQuantity: Number(m.previous_quantity),
      newQuantity: Number(m.new_quantity),
      date: m.date,
      note: m.note,
      referenceId: m.reference_id
    }));

    return {
      success: true,
      message: 'Successfully pulled data from Supabase!',
      data: {
        products,
        sales,
        customers,
        debts,
        expenses,
        stockMovements
      }
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to pull from Supabase' };
  }
}

/**
 * Live background sync helpers (safe non-blocking background writes)
 */
export async function syncProductToSupabase(p: Product) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('products').upsert({
      id: p.id,
      name: p.name,
      category: p.category,
      selling_price: p.sellingPrice,
      cost_price: p.costPrice,
      quantity: p.quantity,
      low_stock_threshold: p.lowStockThreshold,
      sku: p.sku,
      supplier: p.supplier || null,
      created_at: p.createdAt,
      last_restocked_at: p.lastRestockedAt || null
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Background Supabase product sync error:', err);
  }
}

export async function deleteProductFromSupabase(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('products').delete().eq('id', id);
  } catch (err) {
    console.warn('Background Supabase product delete error:', err);
  }
}

export async function syncSaleToSupabase(s: Sale) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('sales').upsert({
      id: s.id,
      invoice_number: s.invoiceNumber,
      date: s.date,
      items: s.items,
      total_amount: s.totalAmount,
      total_cost: s.totalCost,
      net_profit: s.netProfit,
      customer_id: s.customerId || null,
      customer_name: s.customerName || null,
      customer_phone: s.customerPhone || null,
      payment_method: s.paymentMethod,
      payment_status: s.paymentStatus,
      amount_paid: s.amountPaid,
      debt_amount: s.debtAmount,
      notes: s.notes || null
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Background Supabase sale sync error:', err);
  }
}

export async function syncCustomerToSupabase(c: Customer) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('customers').upsert({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      address: c.address || null,
      outstanding_debt: c.outstandingDebt,
      total_purchases: c.totalPurchases,
      order_count: c.orderCount,
      created_at: c.createdAt,
      notes: c.notes || null
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Background Supabase customer sync error:', err);
  }
}

export async function deleteCustomerFromSupabase(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('customers').delete().eq('id', id);
  } catch (err) {
    console.warn('Background Supabase customer delete error:', err);
  }
}

export async function syncDebtToSupabase(d: DebtRecord) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('debts').upsert({
      id: d.id,
      type: d.type,
      party_name: d.partyName,
      customer_id: d.customerId || null,
      reference_sale_id: d.referenceSaleId || null,
      total_debt: d.totalDebt,
      amount_paid: d.amountPaid,
      remaining_balance: d.remainingBalance,
      due_date: d.dueDate || null,
      created_date: d.createdDate,
      status: d.status,
      notes: d.notes || null,
      payments: d.payments
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Background Supabase debt sync error:', err);
  }
}

export async function syncExpenseToSupabase(e: Expense) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('expenses').upsert({
      id: e.id,
      title: e.title,
      category: e.category,
      amount: e.amount,
      date: e.date,
      payee: e.payee,
      payment_method: e.paymentMethod,
      receipt_note: e.receiptNote || null
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Background Supabase expense sync error:', err);
  }
}

export async function deleteExpenseFromSupabase(id: string) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('expenses').delete().eq('id', id);
  } catch (err) {
    console.warn('Background Supabase expense delete error:', err);
  }
}

export async function syncStockMovementToSupabase(m: StockMovement) {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.from('stock_movements').upsert({
      id: m.id,
      product_id: m.productId,
      product_name: m.productName,
      type: m.type,
      quantity_changed: m.quantityChanged,
      previous_quantity: m.previousQuantity,
      new_quantity: m.newQuantity,
      date: m.date,
      note: m.note || null,
      reference_id: m.referenceId || null
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Background Supabase stock movement sync error:', err);
  }
}

