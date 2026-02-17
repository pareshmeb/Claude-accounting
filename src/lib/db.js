import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'accubooks.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category INTEGER NOT NULL,
    description TEXT,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS creditors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    paid REAL NOT NULL DEFAULT 0,
    dueDate TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS debtors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    received REAL NOT NULL DEFAULT 0,
    dueDate TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY,
    billNo TEXT NOT NULL,
    supplierId INTEGER NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'unpaid',
    paidAmount REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (supplierId) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS purchase_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchaseId INTEGER NOT NULL,
    name TEXT NOT NULL,
    qty INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (purchaseId) REFERENCES purchases(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY,
    invoiceNo TEXT NOT NULL,
    customerId INTEGER NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'unpaid',
    paidAmount REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    saleId INTEGER NOT NULL,
    name TEXT NOT NULL,
    qty INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (saleId) REFERENCES sales(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS supplier_payments (
    id INTEGER PRIMARY KEY,
    supplierId INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    reference TEXT,
    description TEXT,
    FOREIGN KEY (supplierId) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS customer_payments (
    id INTEGER PRIMARY KEY,
    customerId INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    reference TEXT,
    description TEXT,
    FOREIGN KEY (customerId) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS creditor_payments (
    id INTEGER PRIMARY KEY,
    creditorId INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (creditorId) REFERENCES creditors(id)
  );

  CREATE TABLE IF NOT EXISTS debtor_receipts (
    id INTEGER PRIMARY KEY,
    debtorId INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (debtorId) REFERENCES debtors(id)
  );

  -- Indexes for search and date filtering
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

  CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
  CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

  CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
  CREATE INDEX IF NOT EXISTS idx_purchases_supplierId ON purchases(supplierId);
  CREATE INDEX IF NOT EXISTS idx_purchase_items_purchaseId ON purchase_items(purchaseId);

  CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
  CREATE INDEX IF NOT EXISTS idx_sales_customerId ON sales(customerId);
  CREATE INDEX IF NOT EXISTS idx_sale_items_saleId ON sale_items(saleId);

  CREATE INDEX IF NOT EXISTS idx_creditors_name ON creditors(name);
  CREATE INDEX IF NOT EXISTS idx_debtors_name ON debtors(name);

  CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplierId ON supplier_payments(supplierId);
  CREATE INDEX IF NOT EXISTS idx_supplier_payments_date ON supplier_payments(date);
  CREATE INDEX IF NOT EXISTS idx_customer_payments_customerId ON customer_payments(customerId);
  CREATE INDEX IF NOT EXISTS idx_customer_payments_date ON customer_payments(date);
  CREATE INDEX IF NOT EXISTS idx_creditor_payments_creditorId ON creditor_payments(creditorId);
  CREATE INDEX IF NOT EXISTS idx_debtor_receipts_debtorId ON debtor_receipts(debtorId);
`);

// Seed data if database is empty
const count = db.prepare('SELECT COUNT(*) as c FROM suppliers').get().c;
if (count === 0) {
  const seed = db.transaction(() => {
    // Suppliers
    db.prepare('INSERT INTO suppliers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)').run(1, 'Office Supplies Co', 'info@officesupplies.com', '555-0101', '123 Main St');
    db.prepare('INSERT INTO suppliers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)').run(2, 'Tech Store', 'sales@techstore.com', '555-0102', '456 Tech Ave');

    // Customers
    db.prepare('INSERT INTO customers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)').run(1, 'ABC Corp', 'contact@abccorp.com', '555-0201', '789 Business Blvd');
    db.prepare('INSERT INTO customers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)').run(2, 'XYZ Ltd', 'info@xyzltd.com', '555-0202', '321 Enterprise Way');

    // Transactions
    db.prepare('INSERT INTO transactions (id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)').run(1, 'income', 5000, 0, 'Monthly salary', '2026-01-01');

    // Creditors
    db.prepare('INSERT INTO creditors (id, name, amount, paid, dueDate, description) VALUES (?, ?, ?, ?, ?, ?)').run(1, 'Bank Loan', 10000, 2000, '2026-12-01', 'Home improvement loan');

    // Debtors
    db.prepare('INSERT INTO debtors (id, name, amount, received, dueDate, description) VALUES (?, ?, ?, ?, ?, ?)').run(1, 'John Smith', 500, 100, '2026-02-01', 'Personal loan');

    // Purchases
    db.prepare('INSERT INTO purchases (id, billNo, supplierId, date, description, status, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)').run(1, 'BILL-001', 1, '2026-01-03', 'Office supplies for Q1', 'paid', 250);
    db.prepare('INSERT INTO purchases (id, billNo, supplierId, date, description, status, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)').run(2, 'BILL-002', 2, '2026-01-04', 'New laptop', 'partial', 500);

    // Purchase items
    db.prepare('INSERT INTO purchase_items (purchaseId, name, qty, price) VALUES (?, ?, ?, ?)').run(1, 'Printer Paper', 10, 25);
    db.prepare('INSERT INTO purchase_items (purchaseId, name, qty, price) VALUES (?, ?, ?, ?)').run(2, 'Laptop', 1, 1200);

    // Sales
    db.prepare('INSERT INTO sales (id, invoiceNo, customerId, date, description, status, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)').run(1, 'INV-001', 1, '2026-01-05', 'Website redesign', 'paid', 1500);
    db.prepare('INSERT INTO sales (id, invoiceNo, customerId, date, description, status, paidAmount) VALUES (?, ?, ?, ?, ?, ?, ?)').run(2, 'INV-002', 2, '2026-01-06', 'Consulting', 'partial', 500);

    // Sale items
    db.prepare('INSERT INTO sale_items (saleId, name, qty, price) VALUES (?, ?, ?, ?)').run(1, 'Web Design', 1, 1500);
    db.prepare('INSERT INTO sale_items (saleId, name, qty, price) VALUES (?, ?, ?, ?)').run(2, 'Consulting', 5, 200);

    // Supplier payments
    db.prepare('INSERT INTO supplier_payments (id, supplierId, amount, date, reference, description) VALUES (?, ?, ?, ?, ?, ?)').run(1, 1, 250, '2026-01-03', 'BILL-001', 'Full payment');
    db.prepare('INSERT INTO supplier_payments (id, supplierId, amount, date, reference, description) VALUES (?, ?, ?, ?, ?, ?)').run(2, 2, 500, '2026-01-05', 'BILL-002', 'Partial payment');

    // Customer payments
    db.prepare('INSERT INTO customer_payments (id, customerId, amount, date, reference, description) VALUES (?, ?, ?, ?, ?, ?)').run(1, 1, 1500, '2026-01-05', 'INV-001', 'Bank transfer');
    db.prepare('INSERT INTO customer_payments (id, customerId, amount, date, reference, description) VALUES (?, ?, ?, ?, ?, ?)').run(2, 2, 500, '2026-01-07', 'INV-002', 'Check payment');

    // Creditor payments
    db.prepare('INSERT INTO creditor_payments (id, creditorId, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(1, 1, 2000, '2026-01-10', 'Monthly installment');

    // Debtor receipts
    db.prepare('INSERT INTO debtor_receipts (id, debtorId, amount, date, description) VALUES (?, ?, ?, ?, ?)').run(1, 1, 100, '2026-01-08', 'First repayment');
  });

  seed();
}

export default db;
