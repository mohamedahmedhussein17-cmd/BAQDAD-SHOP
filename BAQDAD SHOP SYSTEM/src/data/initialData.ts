import { Product, Customer, Sale, DebtRecord, Expense, ShopSettings, StockMovement } from '../types';

export const initialSettings: ShopSettings = {
  shopName: 'BAQDAD Shop',
  tagline: 'Premium Goods & Wholesale Supplies',
  currency: '$',
  phone: '+964 770 123 4567',
  address: 'Al-Mansour Commercial District, Baghdad',
  defaultLowStockThreshold: 5,
  adminName: 'Administrator',
  adminRole: 'Shop Owner / Admin',
  adminEmail: 'admin@baqdadshop.com'
};

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Basmati Rice Premium (5kg)',
    category: 'Groceries',
    sellingPrice: 16.50,
    costPrice: 11.20,
    quantity: 34,
    lowStockThreshold: 8,
    sku: 'BQD-GR-001',
    supplier: 'Al-Khaleej Food Dist.',
    createdAt: '2026-09-01T10:00:00Z',
    lastRestockedAt: '2026-10-18T14:30:00Z'
  },
  {
    id: 'prod-2',
    name: 'Cardamom Roasted Coffee Beans (1kg)',
    category: 'Beverages',
    sellingPrice: 22.00,
    costPrice: 14.50,
    quantity: 18,
    lowStockThreshold: 6,
    sku: 'BQD-BV-002',
    supplier: 'Euphrates Roastery',
    createdAt: '2026-09-01T10:00:00Z',
    lastRestockedAt: '2026-10-20T09:15:00Z'
  },
  {
    id: 'prod-3',
    name: 'Cold-Pressed Extra Virgin Olive Oil (1L)',
    category: 'Groceries',
    sellingPrice: 14.00,
    costPrice: 9.00,
    quantity: 26,
    lowStockThreshold: 7,
    sku: 'BQD-GR-003',
    supplier: 'Levant Harvest Ltd.',
    createdAt: '2026-09-02T11:00:00Z',
    lastRestockedAt: '2026-10-15T16:00:00Z'
  },
  {
    id: 'prod-4',
    name: 'Smart Fast Charger 65W GaN',
    category: 'Electronics',
    sellingPrice: 28.00,
    costPrice: 17.00,
    quantity: 4, // Low stock alert!
    lowStockThreshold: 6,
    sku: 'BQD-EL-004',
    supplier: 'Nile Tech Imports',
    createdAt: '2026-09-05T08:00:00Z',
    lastRestockedAt: '2026-10-05T12:00:00Z'
  },
  {
    id: 'prod-5',
    name: 'Braided Type-C to Lightning Cable 2M',
    category: 'Electronics',
    sellingPrice: 9.50,
    costPrice: 4.20,
    quantity: 3, // Low stock alert!
    lowStockThreshold: 8,
    sku: 'BQD-EL-005',
    supplier: 'Nile Tech Imports',
    createdAt: '2026-09-05T08:00:00Z',
    lastRestockedAt: '2026-10-02T11:00:00Z'
  },
  {
    id: 'prod-6',
    name: 'Pure Blossom Bee Honey (500g)',
    category: 'Groceries',
    sellingPrice: 12.00,
    costPrice: 7.50,
    quantity: 15,
    lowStockThreshold: 5,
    sku: 'BQD-GR-006',
    supplier: 'Kurdistan Apiaries',
    createdAt: '2026-09-10T09:00:00Z',
    lastRestockedAt: '2026-10-19T10:00:00Z'
  },
  {
    id: 'prod-7',
    name: 'Black Ceylon Tea Special Reserve (400g)',
    category: 'Beverages',
    sellingPrice: 8.50,
    costPrice: 5.00,
    quantity: 42,
    lowStockThreshold: 10,
    sku: 'BQD-BV-007',
    supplier: 'Al-Khaleej Food Dist.',
    createdAt: '2026-09-12T13:00:00Z',
    lastRestockedAt: '2026-10-22T11:00:00Z'
  },
  {
    id: 'prod-8',
    name: 'Wireless Bluetooth Earbuds Pro',
    category: 'Electronics',
    sellingPrice: 45.00,
    costPrice: 28.00,
    quantity: 0, // Out of stock!
    lowStockThreshold: 5,
    sku: 'BQD-EL-008',
    supplier: 'Nile Tech Imports',
    createdAt: '2026-09-15T15:00:00Z',
    lastRestockedAt: '2026-09-25T14:00:00Z'
  },
  {
    id: 'prod-9',
    name: 'Stainless Steel Thermal Flask 750ml',
    category: 'Home & Kitchen',
    sellingPrice: 18.00,
    costPrice: 10.50,
    quantity: 21,
    lowStockThreshold: 5,
    sku: 'BQD-HK-009',
    supplier: 'Modern Home Goods',
    createdAt: '2026-09-20T10:00:00Z',
    lastRestockedAt: '2026-10-14T08:30:00Z'
  },
  {
    id: 'prod-10',
    name: 'Organic Raw Medjool Dates (1kg)',
    category: 'Groceries',
    sellingPrice: 15.00,
    costPrice: 9.80,
    quantity: 28,
    lowStockThreshold: 8,
    sku: 'BQD-GR-010',
    supplier: 'Basra Palms Trading',
    createdAt: '2026-09-22T10:00:00Z',
    lastRestockedAt: '2026-10-23T16:00:00Z'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Hassan Al-Tamimi',
    phone: '+964 771 998 2211',
    email: 'hassan.t@example.com',
    address: 'Karrada, Baghdad',
    outstandingDebt: 85.00,
    totalPurchases: 620.00,
    orderCount: 14,
    createdAt: '2026-09-02T14:00:00Z',
    notes: 'Long-standing wholesale client, clears balance monthly.'
  },
  {
    id: 'cust-2',
    name: 'Noor Zainab',
    phone: '+964 780 445 1199',
    email: 'noor.zainab@example.com',
    address: 'Yarmouk, Baghdad',
    outstandingDebt: 32.50,
    totalPurchases: 340.00,
    orderCount: 8,
    createdAt: '2026-09-10T11:00:00Z',
    notes: 'Prefers card payment or bank transfer.'
  },
  {
    id: 'cust-3',
    name: 'Omar Farooq',
    phone: '+964 750 332 8877',
    email: 'omar.f@example.com',
    address: 'Mansour, Street 14, Baghdad',
    outstandingDebt: 0.00,
    totalPurchases: 512.00,
    orderCount: 11,
    createdAt: '2026-09-12T16:30:00Z',
    notes: 'Regular morning customer.'
  },
  {
    id: 'cust-4',
    name: 'Fatima Al-Hashemi',
    phone: '+964 772 884 9900',
    email: 'fatima.h@example.com',
    address: 'Jadriya, Baghdad',
    outstandingDebt: 45.00,
    totalPurchases: 275.00,
    orderCount: 6,
    createdAt: '2026-09-25T12:00:00Z',
    notes: 'Special orders honey and olive oil in bulk.'
  },
  {
    id: 'cust-5',
    name: 'Zaid Tariq',
    phone: '+964 781 662 4433',
    email: 'zaid.tariq@example.com',
    address: 'Adhamiya, Baghdad',
    outstandingDebt: 0.00,
    totalPurchases: 185.00,
    orderCount: 4,
    createdAt: '2026-10-01T09:20:00Z',
    notes: 'Walk-in buyer.'
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'INV-2026-1001',
    date: '2026-10-24T08:45:00Z',
    items: [
      {
        productId: 'prod-1',
        productName: 'Basmati Rice Premium (5kg)',
        quantity: 2,
        unitPrice: 16.50,
        costPrice: 11.20,
        subtotal: 33.00
      },
      {
        productId: 'prod-2',
        productName: 'Cardamom Roasted Coffee Beans (1kg)',
        quantity: 1,
        unitPrice: 22.00,
        costPrice: 14.50,
        subtotal: 22.00
      }
    ],
    totalAmount: 55.00,
    totalCost: 36.90,
    netProfit: 18.10,
    customerId: 'cust-3',
    customerName: 'Omar Farooq',
    customerPhone: '+964 750 332 8877',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    amountPaid: 55.00,
    debtAmount: 0.00,
    notes: 'Walk-in cash counter'
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV-2026-1002',
    date: '2026-10-24T11:15:00Z',
    items: [
      {
        productId: 'prod-6',
        productName: 'Pure Blossom Bee Honey (500g)',
        quantity: 2,
        unitPrice: 12.00,
        costPrice: 7.50,
        subtotal: 24.00
      },
      {
        productId: 'prod-10',
        productName: 'Organic Raw Medjool Dates (1kg)',
        quantity: 2,
        unitPrice: 15.00,
        costPrice: 9.80,
        subtotal: 30.00
      }
    ],
    totalAmount: 54.00,
    totalCost: 34.60,
    netProfit: 19.40,
    customerId: 'cust-1',
    customerName: 'Hassan Al-Tamimi',
    customerPhone: '+964 771 998 2211',
    paymentMethod: 'Customer Debt',
    paymentStatus: 'Credit / Debt',
    amountPaid: 0.00,
    debtAmount: 54.00,
    notes: 'Purchased on customer credit account'
  },
  {
    id: 'sale-3',
    invoiceNumber: 'INV-2026-1003',
    date: '2026-10-23T15:20:00Z',
    items: [
      {
        productId: 'prod-4',
        productName: 'Smart Fast Charger 65W GaN',
        quantity: 2,
        unitPrice: 28.00,
        costPrice: 17.00,
        subtotal: 56.00
      },
      {
        productId: 'prod-5',
        productName: 'Braided Type-C to Lightning Cable 2M',
        quantity: 2,
        unitPrice: 9.50,
        costPrice: 4.20,
        subtotal: 19.00
      }
    ],
    totalAmount: 75.00,
    totalCost: 42.40,
    netProfit: 32.60,
    customerId: 'cust-2',
    customerName: 'Noor Zainab',
    customerPhone: '+964 780 445 1199',
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    amountPaid: 75.00,
    debtAmount: 0.00,
    notes: 'Visa card transaction'
  },
  {
    id: 'sale-4',
    invoiceNumber: 'INV-2026-1004',
    date: '2026-10-22T17:10:00Z',
    items: [
      {
        productId: 'prod-3',
        productName: 'Cold-Pressed Extra Virgin Olive Oil (1L)',
        quantity: 3,
        unitPrice: 14.00,
        costPrice: 9.00,
        subtotal: 42.00
      },
      {
        productId: 'prod-7',
        productName: 'Black Ceylon Tea Special Reserve (400g)',
        quantity: 2,
        unitPrice: 8.50,
        costPrice: 5.00,
        subtotal: 17.00
      }
    ],
    totalAmount: 59.00,
    totalCost: 37.00,
    netProfit: 22.00,
    customerId: 'cust-4',
    customerName: 'Fatima Al-Hashemi',
    customerPhone: '+964 772 884 9900',
    paymentMethod: 'Customer Debt',
    paymentStatus: 'Partially Paid',
    amountPaid: 14.00,
    debtAmount: 45.00,
    notes: '$14 paid in cash, $45 balance to account'
  },
  {
    id: 'sale-5',
    invoiceNumber: 'INV-2026-1005',
    date: '2026-10-21T13:40:00Z',
    items: [
      {
        productId: 'prod-9',
        productName: 'Stainless Steel Thermal Flask 750ml',
        quantity: 1,
        unitPrice: 18.00,
        costPrice: 10.50,
        subtotal: 18.00
      },
      {
        productId: 'prod-2',
        productName: 'Cardamom Roasted Coffee Beans (1kg)',
        quantity: 1,
        unitPrice: 22.00,
        costPrice: 14.50,
        subtotal: 22.00
      }
    ],
    totalAmount: 40.00,
    totalCost: 25.00,
    netProfit: 15.00,
    customerName: 'Walk-in Guest',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    amountPaid: 40.00,
    debtAmount: 0.00
  },
  {
    id: 'sale-6',
    invoiceNumber: 'INV-2026-1006',
    date: '2026-10-19T10:15:00Z',
    items: [
      {
        productId: 'prod-1',
        productName: 'Basmati Rice Premium (5kg)',
        quantity: 5,
        unitPrice: 16.50,
        costPrice: 11.20,
        subtotal: 82.50
      }
    ],
    totalAmount: 82.50,
    totalCost: 56.00,
    netProfit: 26.50,
    customerId: 'cust-1',
    customerName: 'Hassan Al-Tamimi',
    customerPhone: '+964 771 998 2211',
    paymentMethod: 'Customer Debt',
    paymentStatus: 'Credit / Debt',
    amountPaid: 51.50,
    debtAmount: 31.00
  }
];

export const initialDebts: DebtRecord[] = [
  {
    id: 'debt-1',
    type: 'CUSTOMER',
    partyName: 'Hassan Al-Tamimi',
    customerId: 'cust-1',
    referenceSaleId: 'sale-2',
    totalDebt: 85.00,
    amountPaid: 0.00,
    remainingBalance: 85.00,
    dueDate: '2026-11-05',
    createdDate: '2026-10-19T10:15:00Z',
    status: 'Unpaid',
    notes: 'Cumulative groceries credit for family store',
    payments: []
  },
  {
    id: 'debt-2',
    type: 'CUSTOMER',
    partyName: 'Noor Zainab',
    customerId: 'cust-2',
    totalDebt: 32.50,
    amountPaid: 0.00,
    remainingBalance: 32.50,
    dueDate: '2026-10-31',
    createdDate: '2026-10-20T14:00:00Z',
    status: 'Unpaid',
    notes: 'Electronics accessories pending salary credit',
    payments: []
  },
  {
    id: 'debt-3',
    type: 'CUSTOMER',
    partyName: 'Fatima Al-Hashemi',
    customerId: 'cust-4',
    referenceSaleId: 'sale-4',
    totalDebt: 45.00,
    amountPaid: 0.00,
    remainingBalance: 45.00,
    dueDate: '2026-11-01',
    createdDate: '2026-10-22T17:10:00Z',
    status: 'Unpaid',
    notes: 'Bulk olive oil and tea shipment balance',
    payments: []
  },
  {
    id: 'debt-4',
    type: 'SUPPLIER',
    partyName: 'Al-Khaleej Food Dist.',
    totalDebt: 280.00,
    amountPaid: 100.00,
    remainingBalance: 180.00,
    dueDate: '2026-11-10',
    createdDate: '2026-10-18T14:30:00Z',
    status: 'Partially Paid',
    notes: 'Shipment batch #992 (Rice and Ceylon Tea restock)',
    payments: [
      {
        id: 'pay-sup-1',
        amount: 100.00,
        date: '2026-10-22T10:00:00Z',
        method: 'Bank Transfer',
        note: 'Advance payment check'
      }
    ]
  },
  {
    id: 'debt-5',
    type: 'SUPPLIER',
    partyName: 'Euphrates Roastery',
    totalDebt: 145.00,
    amountPaid: 145.00,
    remainingBalance: 0.00,
    dueDate: '2026-10-25',
    createdDate: '2026-10-12T09:00:00Z',
    status: 'Settled',
    notes: 'Cardamom coffee beans batch settled in full',
    payments: [
      {
        id: 'pay-sup-2',
        amount: 145.00,
        date: '2026-10-20T11:00:00Z',
        method: 'Cash',
        note: 'Full settlement at delivery'
      }
    ]
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    title: 'Monthly Commercial Shop Rent',
    category: 'Rent',
    amount: 350.00,
    date: '2026-10-01T08:00:00Z',
    payee: 'Al-Mansour Properties Ltd.',
    paymentMethod: 'Bank Transfer',
    receiptNote: 'October 2026 Store Rent - Receipt #7741'
  },
  {
    id: 'exp-2',
    title: 'Commercial Electric Generator & Power Grid',
    category: 'Utilities',
    amount: 85.00,
    date: '2026-10-05T12:00:00Z',
    payee: 'Neighborhood Generator Service',
    paymentMethod: 'Cash',
    receiptNote: 'October subscription'
  },
  {
    id: 'exp-3',
    title: 'Assistant Cashier Weekly Salary',
    category: 'Salaries',
    amount: 120.00,
    date: '2026-10-22T18:00:00Z',
    payee: 'Mustafa Adel',
    paymentMethod: 'Cash',
    receiptNote: 'Week 4 October salary distribution'
  },
  {
    id: 'exp-4',
    title: 'Inventory Delivery Van Logistics',
    category: 'Transport',
    amount: 35.00,
    date: '2026-10-18T16:00:00Z',
    payee: 'Baghdad Express Freight',
    paymentMethod: 'Cash',
    receiptNote: 'Warehouse delivery fuel and driver fee'
  },
  {
    id: 'exp-5',
    title: 'Thermal POS Printer Paper Rolls & Packaging Bags',
    category: 'Supplies',
    amount: 28.00,
    date: '2026-10-15T14:30:00Z',
    payee: 'Modern Print & Paper Co.',
    paymentMethod: 'Cash',
    receiptNote: '10x thermal rolls + 200 craft paper bags'
  }
];

export const initialStockMovements: StockMovement[] = [
  {
    id: 'sm-1',
    productId: 'prod-1',
    productName: 'Basmati Rice Premium (5kg)',
    type: 'RESTOCK',
    quantityChanged: 20,
    previousQuantity: 16,
    newQuantity: 36,
    date: '2026-10-18T14:30:00Z',
    note: 'Shipment from Al-Khaleej Food Dist.',
    referenceId: 'PO-2026-881'
  },
  {
    id: 'sm-2',
    productId: 'prod-2',
    productName: 'Cardamom Roasted Coffee Beans (1kg)',
    type: 'RESTOCK',
    quantityChanged: 10,
    previousQuantity: 9,
    newQuantity: 19,
    date: '2026-10-20T09:15:00Z',
    note: 'Fresh roast batch delivery'
  },
  {
    id: 'sm-3',
    productId: 'prod-1',
    productName: 'Basmati Rice Premium (5kg)',
    type: 'SALE',
    quantityChanged: -2,
    previousQuantity: 36,
    newQuantity: 34,
    date: '2026-10-24T08:45:00Z',
    note: 'Sale counter invoice INV-2026-1001',
    referenceId: 'INV-2026-1001'
  },
  {
    id: 'sm-4',
    productId: 'prod-2',
    productName: 'Cardamom Roasted Coffee Beans (1kg)',
    type: 'SALE',
    quantityChanged: -1,
    previousQuantity: 19,
    newQuantity: 18,
    date: '2026-10-24T08:45:00Z',
    note: 'Sale invoice INV-2026-1001',
    referenceId: 'INV-2026-1001'
  },
  {
    id: 'sm-5',
    productId: 'prod-6',
    productName: 'Pure Blossom Bee Honey (500g)',
    type: 'SALE',
    quantityChanged: -2,
    previousQuantity: 17,
    newQuantity: 15,
    date: '2026-10-24T11:15:00Z',
    note: 'Sale invoice INV-2026-1002',
    referenceId: 'INV-2026-1002'
  },
  {
    id: 'sm-6',
    productId: 'prod-10',
    productName: 'Organic Raw Medjool Dates (1kg)',
    type: 'SALE',
    quantityChanged: -2,
    previousQuantity: 30,
    newQuantity: 28,
    date: '2026-10-24T11:15:00Z',
    note: 'Sale invoice INV-2026-1002',
    referenceId: 'INV-2026-1002'
  }
];
