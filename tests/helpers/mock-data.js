export const mockSuppliers = [
  { id: 1, name: 'Office Supplies Co', email: 'info@officesupplies.com', phone: '555-0101', address: '123 Main St' },
  { id: 2, name: 'Tech Store', email: 'sales@techstore.com', phone: '555-0102', address: '456 Tech Ave' },
];

export const mockCustomers = [
  { id: 1, name: 'ABC Corp', email: 'contact@abccorp.com', phone: '555-0201', address: '789 Business Blvd' },
  { id: 2, name: 'XYZ Ltd', email: 'info@xyzltd.com', phone: '555-0202', address: '321 Enterprise Way' },
];

export const mockTransactions = [
  { id: 1, type: 'income', amount: 5000, category: 0, description: 'Monthly salary', date: '2026-01-01' },
  { id: 2, type: 'expense', amount: 200, category: 0, description: 'Groceries', date: '2026-01-02' },
];

export const mockPurchases = [
  { id: 1, billNo: 'BILL-001', supplierId: 1, date: '2026-01-03', description: 'Office supplies for Q1', status: 'paid', paidAmount: 250, items: [{ name: 'Printer Paper', qty: 10, price: 25 }] },
  { id: 2, billNo: 'BILL-002', supplierId: 2, date: '2026-01-04', description: 'New laptop', status: 'partial', paidAmount: 500, items: [{ name: 'Laptop', qty: 1, price: 1200 }] },
];

export const mockSales = [
  { id: 1, invoiceNo: 'INV-001', customerId: 1, date: '2026-01-05', description: 'Website redesign', status: 'paid', paidAmount: 1500, items: [{ name: 'Web Design', qty: 1, price: 1500 }] },
  { id: 2, invoiceNo: 'INV-002', customerId: 2, date: '2026-01-06', description: 'Consulting', status: 'partial', paidAmount: 500, items: [{ name: 'Consulting', qty: 5, price: 200 }] },
];

export const mockCreditors = [
  { id: 1, name: 'Bank Loan', amount: 10000, paid: 2000, dueDate: '2026-12-01', description: 'Home improvement loan' },
];

export const mockDebtors = [
  { id: 1, name: 'John Smith', amount: 500, received: 100, dueDate: '2026-02-01', description: 'Personal loan' },
];

export const mockSupplierPayments = [
  { id: 1, supplierId: 1, amount: 250, date: '2026-01-03', reference: 'BILL-001', description: 'Full payment' },
  { id: 2, supplierId: 2, amount: 500, date: '2026-01-05', reference: 'BILL-002', description: 'Partial payment' },
];

export const mockCustomerPayments = [
  { id: 1, customerId: 1, amount: 1500, date: '2026-01-05', reference: 'INV-001', description: 'Bank transfer' },
  { id: 2, customerId: 2, amount: 500, date: '2026-01-07', reference: 'INV-002', description: 'Check payment' },
];

export const mockCreditorPayments = [
  { id: 1, creditorId: 1, amount: 2000, date: '2026-01-10', description: 'Monthly installment' },
];

export const mockDebtorReceipts = [
  { id: 1, debtorId: 1, amount: 100, date: '2026-01-08', description: 'First repayment' },
];
