'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [creditors, setCreditors] = useState([]);
  const [debtors, setDebtors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [supplierPayments, setSupplierPayments] = useState([]);
  const [customerPayments, setCustomerPayments] = useState([]);
  const [creditorPayments, setCreditorPayments] = useState([]);
  const [debtorReceipts, setDebtorReceipts] = useState([]);

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

  // Fetch all data on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/transactions').then(r => r.json()),
      fetch('/api/suppliers').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/creditors').then(r => r.json()),
      fetch('/api/debtors').then(r => r.json()),
      fetch('/api/purchases').then(r => r.json()),
      fetch('/api/sales').then(r => r.json()),
      fetch('/api/supplier-payments').then(r => r.json()),
      fetch('/api/customer-payments').then(r => r.json()),
      fetch('/api/creditor-payments').then(r => r.json()),
      fetch('/api/debtor-receipts').then(r => r.json()),
    ]).then(([tx, sup, cust, cred, debt, purch, sal, sp, cp, credp, dr]) => {
      setTransactions(tx);
      setSuppliers(sup);
      setCustomers(cust);
      setCreditors(cred);
      setDebtors(debt);
      setPurchases(purch);
      setSales(sal);
      setSupplierPayments(sp);
      setCustomerPayments(cp);
      setCreditorPayments(credp);
      setDebtorReceipts(dr);
      setLoading(false);
    });
  }, []);

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
  const addSupplierAction = async () => {
    if (!newSupplier.name) return;
    const supplier = { ...newSupplier, id: Date.now() };
    await fetch('/api/suppliers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(supplier) });
    setSuppliers([...suppliers, supplier]);
    setNewSupplier({ name: '', email: '', phone: '', address: '' });
    setShowModal(null);
  };

  const addCustomerAction = async () => {
    if (!newCustomer.name) return;
    const customer = { ...newCustomer, id: Date.now() };
    await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(customer) });
    setCustomers([...customers, customer]);
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    setShowModal(null);
  };

  const addCreditorAction = async () => {
    if (!newCreditor.name || !newCreditor.amount) return;
    const creditor = { ...newCreditor, id: Date.now(), amount: parseFloat(newCreditor.amount), paid: 0 };
    await fetch('/api/creditors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(creditor) });
    setCreditors([...creditors, creditor]);
    setNewCreditor({ name: '', amount: '', dueDate: '', description: '' });
    setShowModal(null);
  };

  const addDebtorAction = async () => {
    if (!newDebtor.name || !newDebtor.amount) return;
    const debtor = { ...newDebtor, id: Date.now(), amount: parseFloat(newDebtor.amount), received: 0 };
    await fetch('/api/debtors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(debtor) });
    setDebtors([...debtors, debtor]);
    setNewDebtor({ name: '', amount: '', dueDate: '', description: '' });
    setShowModal(null);
  };

  const addPurchaseAction = async () => {
    if (!newPurchase.supplierId || newPurchase.items.some(i => !i.name || !i.price)) return;
    const items = newPurchase.items.map(i => ({ ...i, qty: parseInt(i.qty), price: parseFloat(i.price) }));
    const billNo = `BILL-${String(purchases.length + 1).padStart(3, '0')}`;
    const purchase = { ...newPurchase, id: Date.now(), billNo, supplierId: parseInt(newPurchase.supplierId), items, status: 'unpaid', paidAmount: 0 };
    await fetch('/api/purchases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(purchase) });
    setPurchases([...purchases, purchase]);
    setNewPurchase({ supplierId: '', date: new Date().toISOString().split('T')[0], description: '', items: [{ name: '', qty: 1, price: '' }] });
    setShowModal(null);
  };

  const addSaleAction = async () => {
    if (!newSale.customerId || newSale.items.some(i => !i.name || !i.price)) return;
    const items = newSale.items.map(i => ({ ...i, qty: parseInt(i.qty), price: parseFloat(i.price) }));
    const invoiceNo = `INV-${String(sales.length + 1).padStart(3, '0')}`;
    const sale = { ...newSale, id: Date.now(), invoiceNo, customerId: parseInt(newSale.customerId), items, status: 'unpaid', paidAmount: 0 };
    await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sale) });
    setSales([...sales, sale]);
    setNewSale({ customerId: '', date: new Date().toISOString().split('T')[0], description: '', items: [{ name: '', qty: 1, price: '' }] });
    setShowModal(null);
  };

  const addTransactionAction = async () => {
    if (!newTx.amount || newTx.category === '') return;
    const tx = { ...newTx, id: Date.now(), amount: parseFloat(newTx.amount), category: parseInt(newTx.category) };
    await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tx) });
    setTransactions([...transactions, tx]);
    setNewTx({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(null);
  };

  const makePaymentAction = async () => {
    if (!paymentAmount || !paymentModal) return;
    const amt = parseFloat(paymentAmount);
    const date = new Date().toISOString().split('T')[0];
    const { type, id, name, billNo, invoiceNo } = paymentModal;
    const transactionId = Date.now();

    let transactionType, transactionCategory, transactionDescription;

    if (type === 'supplier') {
      transactionType = 'expense';
      transactionCategory = 6;
      transactionDescription = paymentDesc || `${t.payment} ${t.to} ${name}`;
    } else if (type === 'customer') {
      transactionType = 'income';
      transactionCategory = 3;
      transactionDescription = paymentDesc || `${t.receipt} ${t.from} ${name}`;
    } else if (type === 'creditor') {
      transactionType = 'expense';
      transactionCategory = 7;
      transactionDescription = paymentDesc || `${t.payment} ${t.to} ${name}`;
    } else if (type === 'debtor') {
      transactionType = 'income';
      transactionCategory = 4;
      transactionDescription = paymentDesc || `${t.receipt} ${t.from} ${name}`;
    }

    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type, id, amount: amt, date, description: paymentDesc, reference: billNo || invoiceNo || 'Direct',
        billNo, invoiceNo,
        transactionId, transactionType, transactionCategory, transactionDescription,
      }),
    });

    // Update local state to match
    const newTxRecord = { id: transactionId, type: transactionType, amount: amt, category: transactionCategory, description: transactionDescription, date };
    setTransactions(prev => [...prev, newTxRecord]);

    if (type === 'supplier') {
      setSupplierPayments(prev => [...prev, { id: Date.now(), supplierId: id, amount: amt, date, reference: billNo || 'Direct', description: paymentDesc }]);
      if (billNo) {
        setPurchases(prev => prev.map(x => {
          if (x.billNo !== billNo) return x;
          const newPaid = x.paidAmount + amt;
          return { ...x, paidAmount: newPaid, status: newPaid >= getTotal(x.items) ? 'paid' : 'partial' };
        }));
      }
    } else if (type === 'customer') {
      setCustomerPayments(prev => [...prev, { id: Date.now(), customerId: id, amount: amt, date, reference: invoiceNo || 'Direct', description: paymentDesc }]);
      if (invoiceNo) {
        setSales(prev => prev.map(x => {
          if (x.invoiceNo !== invoiceNo) return x;
          const newPaid = x.paidAmount + amt;
          return { ...x, paidAmount: newPaid, status: newPaid >= getTotal(x.items) ? 'paid' : 'partial' };
        }));
      }
    } else if (type === 'creditor') {
      setCreditors(prev => prev.map(c => c.id === id ? { ...c, paid: c.paid + amt } : c));
      setCreditorPayments(prev => [...prev, { id: Date.now(), creditorId: id, amount: amt, date, description: paymentDesc }]);
    } else if (type === 'debtor') {
      setDebtors(prev => prev.map(d => d.id === id ? { ...d, received: d.received + amt } : d));
      setDebtorReceipts(prev => [...prev, { id: Date.now(), debtorId: id, amount: amt, date, description: paymentDesc }]);
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

  const deleteTransaction = async (id) => {
    await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    setTransactions(transactions.filter(x => x.id !== id));
  };

  const deleteCreditor = async (id) => {
    await fetch(`/api/creditors/${id}`, { method: 'DELETE' });
    setCreditors(creditors.filter(x => x.id !== id));
  };

  const deleteDebtor = async (id) => {
    await fetch(`/api/debtors/${id}`, { method: 'DELETE' });
    setDebtors(debtors.filter(x => x.id !== id));
  };

  const value = {
    lang, setLang, t, loading,
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
