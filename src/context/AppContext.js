'use client';
import { createContext, useContext, useState } from 'react';
import { translations } from '@/lib/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', amount: 5000, category: 0, description: 'Monthly salary', date: '2026-01-01' },
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Office Supplies Co', email: 'info@officesupplies.com', phone: '555-0101', address: '123 Main St' },
    { id: 2, name: 'Tech Store', email: 'sales@techstore.com', phone: '555-0102', address: '456 Tech Ave' },
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'ABC Corp', email: 'contact@abccorp.com', phone: '555-0201', address: '789 Business Blvd' },
    { id: 2, name: 'XYZ Ltd', email: 'info@xyzltd.com', phone: '555-0202', address: '321 Enterprise Way' },
  ]);

  const [creditors, setCreditors] = useState([
    { id: 1, name: 'Bank Loan', amount: 10000, paid: 2000, dueDate: '2026-12-01', description: 'Home improvement loan' },
  ]);

  const [debtors, setDebtors] = useState([
    { id: 1, name: 'John Smith', amount: 500, received: 100, dueDate: '2026-02-01', description: 'Personal loan' },
  ]);

  const [purchases, setPurchases] = useState([
    { id: 1, billNo: 'BILL-001', supplierId: 1, date: '2026-01-03', description: 'Office supplies for Q1', items: [{ name: 'Printer Paper', qty: 10, price: 25 }], status: 'paid', paidAmount: 250 },
    { id: 2, billNo: 'BILL-002', supplierId: 2, date: '2026-01-04', description: 'New laptop', items: [{ name: 'Laptop', qty: 1, price: 1200 }], status: 'partial', paidAmount: 500 },
  ]);

  const [sales, setSales] = useState([
    { id: 1, invoiceNo: 'INV-001', customerId: 1, date: '2026-01-05', description: 'Website redesign', items: [{ name: 'Web Design', qty: 1, price: 1500 }], status: 'paid', paidAmount: 1500 },
    { id: 2, invoiceNo: 'INV-002', customerId: 2, date: '2026-01-06', description: 'Consulting', items: [{ name: 'Consulting', qty: 5, price: 200 }], status: 'partial', paidAmount: 500 },
  ]);

  const [supplierPayments, setSupplierPayments] = useState([
    { id: 1, supplierId: 1, amount: 250, date: '2026-01-03', reference: 'BILL-001', description: 'Full payment' },
    { id: 2, supplierId: 2, amount: 500, date: '2026-01-05', reference: 'BILL-002', description: 'Partial payment' },
  ]);

  const [customerPayments, setCustomerPayments] = useState([
    { id: 1, customerId: 1, amount: 1500, date: '2026-01-05', reference: 'INV-001', description: 'Bank transfer' },
    { id: 2, customerId: 2, amount: 500, date: '2026-01-07', reference: 'INV-002', description: 'Check payment' },
  ]);

  const [creditorPayments, setCreditorPayments] = useState([
    { id: 1, creditorId: 1, amount: 2000, date: '2026-01-10', description: 'Monthly installment' },
  ]);

  const [debtorReceipts, setDebtorReceipts] = useState([
    { id: 1, debtorId: 1, amount: 100, date: '2026-01-08', description: 'First repayment' },
  ]);

  const [showModal, setShowModal] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('');

  // Form states
  const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '', address: '' });
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [newCreditor, setNewCreditor] = useState({ name: '', amount: '', dueDate: '', description: '' });
  const [newDebtor, setNewDebtor] = useState({ name: '', amount: '', dueDate: '', description: '' });
  const [newPurchase, setNewPurchase] = useState({ supplierId: '', date: new Date().toISOString().split('T')[0], description: '', items: [{ name: '', qty: 1, price: '' }] });
  const [newSale, setNewSale] = useState({ customerId: '', date: new Date().toISOString().split('T')[0], description: '', items: [{ name: '', qty: 1, price: '' }] });
  const [newTx, setNewTx] = useState({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });

  // Helpers
  const getTotal = (items) => items.reduce((s, i) => s + (i.qty * i.price), 0);
  const getSupplier = (id) => suppliers.find(s => s.id === id);
  const getCustomer = (id) => customers.find(c => c.id === id);
  const getCategoryName = (type, idx) => t.categories[type][idx] || t.categories[type][t.categories[type].length - 1];

  const getSupplierBalance = (supplierId) => {
    const totalPurchases = purchases.filter(p => p.supplierId === supplierId).reduce((s, p) => s + getTotal(p.items), 0);
    const totalPaid = supplierPayments.filter(p => p.supplierId === supplierId).reduce((s, p) => s + p.amount, 0);
    return totalPurchases - totalPaid;
  };

  const getCustomerBalance = (customerId) => {
    const totalSales = sales.filter(s => s.customerId === customerId).reduce((s, sale) => s + getTotal(sale.items), 0);
    const totalReceived = customerPayments.filter(p => p.customerId === customerId).reduce((s, p) => s + p.amount, 0);
    return totalSales - totalReceived;
  };

  // Computed values
  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const balance = totalIncome - totalExpense;
  const totalPayables = suppliers.reduce((s, sup) => s + getSupplierBalance(sup.id), 0);
  const totalReceivables = customers.reduce((s, cust) => s + getCustomerBalance(cust.id), 0);
  const totalSalesAmt = sales.reduce((s, sale) => s + getTotal(sale.items), 0);
  const totalPurchasesAmt = purchases.reduce((s, p) => s + getTotal(p.items), 0);
  const totalCreditorOwed = creditors.reduce((s, c) => s + (c.amount - c.paid), 0);
  const totalDebtorOwed = debtors.reduce((s, d) => s + (d.amount - d.received), 0);

  // Actions
  const addSupplierAction = () => {
    if (!newSupplier.name) return;
    setSuppliers([...suppliers, { ...newSupplier, id: Date.now() }]);
    setNewSupplier({ name: '', email: '', phone: '', address: '' });
    setShowModal(null);
  };

  const addCustomerAction = () => {
    if (!newCustomer.name) return;
    setCustomers([...customers, { ...newCustomer, id: Date.now() }]);
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    setShowModal(null);
  };

  const addCreditorAction = () => {
    if (!newCreditor.name || !newCreditor.amount) return;
    setCreditors([...creditors, { ...newCreditor, id: Date.now(), amount: parseFloat(newCreditor.amount), paid: 0 }]);
    setNewCreditor({ name: '', amount: '', dueDate: '', description: '' });
    setShowModal(null);
  };

  const addDebtorAction = () => {
    if (!newDebtor.name || !newDebtor.amount) return;
    setDebtors([...debtors, { ...newDebtor, id: Date.now(), amount: parseFloat(newDebtor.amount), received: 0 }]);
    setNewDebtor({ name: '', amount: '', dueDate: '', description: '' });
    setShowModal(null);
  };

  const addPurchaseAction = () => {
    if (!newPurchase.supplierId || newPurchase.items.some(i => !i.name || !i.price)) return;
    const items = newPurchase.items.map(i => ({ ...i, qty: parseInt(i.qty), price: parseFloat(i.price) }));
    const billNo = `BILL-${String(purchases.length + 1).padStart(3, '0')}`;
    setPurchases([...purchases, { ...newPurchase, id: Date.now(), billNo, supplierId: parseInt(newPurchase.supplierId), items, status: 'unpaid', paidAmount: 0 }]);
    setNewPurchase({ supplierId: '', date: new Date().toISOString().split('T')[0], description: '', items: [{ name: '', qty: 1, price: '' }] });
    setShowModal(null);
  };

  const addSaleAction = () => {
    if (!newSale.customerId || newSale.items.some(i => !i.name || !i.price)) return;
    const items = newSale.items.map(i => ({ ...i, qty: parseInt(i.qty), price: parseFloat(i.price) }));
    const invoiceNo = `INV-${String(sales.length + 1).padStart(3, '0')}`;
    setSales([...sales, { ...newSale, id: Date.now(), invoiceNo, customerId: parseInt(newSale.customerId), items, status: 'unpaid', paidAmount: 0 }]);
    setNewSale({ customerId: '', date: new Date().toISOString().split('T')[0], description: '', items: [{ name: '', qty: 1, price: '' }] });
    setShowModal(null);
  };

  const addTransactionAction = () => {
    if (!newTx.amount || newTx.category === '') return;
    setTransactions([...transactions, { ...newTx, id: Date.now(), amount: parseFloat(newTx.amount), category: parseInt(newTx.category) }]);
    setNewTx({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(null);
  };

  const makePaymentAction = () => {
    if (!paymentAmount || !paymentModal) return;
    const amt = parseFloat(paymentAmount);
    const date = new Date().toISOString().split('T')[0];
    const { type, id, name, billNo, invoiceNo } = paymentModal;

    if (type === 'supplier') {
      setSupplierPayments([...supplierPayments, { id: Date.now(), supplierId: id, amount: amt, date, reference: billNo || 'Direct', description: paymentDesc }]);
      if (billNo) {
        const p = purchases.find(p => p.billNo === billNo);
        const newPaid = p.paidAmount + amt;
        setPurchases(purchases.map(x => x.billNo === billNo ? { ...x, paidAmount: newPaid, status: newPaid >= getTotal(x.items) ? 'paid' : 'partial' } : x));
      }
      setTransactions([...transactions, { id: Date.now(), type: 'expense', amount: amt, category: 6, description: paymentDesc || `${t.payment} ${t.to} ${name}`, date }]);
    } else if (type === 'customer') {
      setCustomerPayments([...customerPayments, { id: Date.now(), customerId: id, amount: amt, date, reference: invoiceNo || 'Direct', description: paymentDesc }]);
      if (invoiceNo) {
        const s = sales.find(s => s.invoiceNo === invoiceNo);
        const newPaid = s.paidAmount + amt;
        setSales(sales.map(x => x.invoiceNo === invoiceNo ? { ...x, paidAmount: newPaid, status: newPaid >= getTotal(x.items) ? 'paid' : 'partial' } : x));
      }
      setTransactions([...transactions, { id: Date.now(), type: 'income', amount: amt, category: 3, description: paymentDesc || `${t.receipt} ${t.from} ${name}`, date }]);
    } else if (type === 'creditor') {
      setCreditors(creditors.map(c => c.id === id ? { ...c, paid: c.paid + amt } : c));
      setCreditorPayments([...creditorPayments, { id: Date.now(), creditorId: id, amount: amt, date, description: paymentDesc }]);
      setTransactions([...transactions, { id: Date.now(), type: 'expense', amount: amt, category: 7, description: paymentDesc || `${t.payment} ${t.to} ${name}`, date }]);
    } else if (type === 'debtor') {
      setDebtors(debtors.map(d => d.id === id ? { ...d, received: d.received + amt } : d));
      setDebtorReceipts([...debtorReceipts, { id: Date.now(), debtorId: id, amount: amt, date, description: paymentDesc }]);
      setTransactions([...transactions, { id: Date.now(), type: 'income', amount: amt, category: 4, description: paymentDesc || `${t.receipt} ${t.from} ${name}`, date }]);
    }
    setPaymentModal(null);
    setPaymentAmount('');
    setPaymentDesc('');
  };

  const addItem = (type) => {
    if (type === 'sale') setNewSale({ ...newSale, items: [...newSale.items, { name: '', qty: 1, price: '' }] });
    else setNewPurchase({ ...newPurchase, items: [...newPurchase.items, { name: '', qty: 1, price: '' }] });
  };

  const updateItem = (type, idx, field, value) => {
    if (type === 'sale') {
      const items = [...newSale.items];
      items[idx][field] = value;
      setNewSale({ ...newSale, items });
    } else {
      const items = [...newPurchase.items];
      items[idx][field] = value;
      setNewPurchase({ ...newPurchase, items });
    }
  };

  const removeItem = (type, idx) => {
    if (type === 'sale') setNewSale({ ...newSale, items: newSale.items.filter((_, i) => i !== idx) });
    else setNewPurchase({ ...newPurchase, items: newPurchase.items.filter((_, i) => i !== idx) });
  };

  const deleteTransaction = (id) => setTransactions(transactions.filter(x => x.id !== id));
  const deleteCreditor = (id) => setCreditors(creditors.filter(x => x.id !== id));
  const deleteDebtor = (id) => setDebtors(debtors.filter(x => x.id !== id));

  const value = {
    lang, setLang, t,
    transactions, suppliers, customers, creditors, debtors,
    purchases, sales,
    supplierPayments, customerPayments, creditorPayments, debtorReceipts,
    showModal, setShowModal,
    paymentModal, setPaymentModal,
    paymentAmount, setPaymentAmount,
    paymentDesc, setPaymentDesc,
    newSupplier, setNewSupplier,
    newCustomer, setNewCustomer,
    newCreditor, setNewCreditor,
    newDebtor, setNewDebtor,
    newPurchase, setNewPurchase,
    newSale, setNewSale,
    newTx, setNewTx,
    getTotal, getSupplier, getCustomer, getCategoryName,
    getSupplierBalance, getCustomerBalance,
    totalIncome, totalExpense, balance,
    totalPayables, totalReceivables,
    totalSalesAmt, totalPurchasesAmt,
    totalCreditorOwed, totalDebtorOwed,
    addSupplierAction, addCustomerAction,
    addCreditorAction, addDebtorAction,
    addPurchaseAction, addSaleAction,
    addTransactionAction, makePaymentAction,
    addItem, updateItem, removeItem,
    deleteTransaction, deleteCreditor, deleteDebtor,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
