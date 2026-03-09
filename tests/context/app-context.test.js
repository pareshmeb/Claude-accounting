import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AppProvider, useApp } from '@/context/AppContext';

const mockData = {
  '/api/transactions': [
    { id: 1, type: 'income', amount: 5000, category: 0, description: 'Salary', date: '2026-01-01' },
    { id: 2, type: 'expense', amount: 200, category: 0, description: 'Food', date: '2026-01-02' },
  ],
  '/api/suppliers': [{ id: 1, name: 'Supplier A', email: '', phone: '', address: '' }],
  '/api/customers': [{ id: 1, name: 'Customer A', email: '', phone: '', address: '' }],
  '/api/creditors': [{ id: 1, name: 'Creditor A', amount: 1000, paid: 200, dueDate: '', description: '' }],
  '/api/debtors': [{ id: 1, name: 'Debtor A', amount: 500, received: 100, dueDate: '', description: '' }],
  '/api/purchases': [
    {
      id: 1,
      billNo: 'BILL-001',
      supplierId: 1,
      date: '2026-01-03',
      description: '',
      status: 'unpaid',
      paidAmount: 0,
      items: [{ name: 'Paper', qty: 10, price: 25 }],
    },
  ],
  '/api/sales': [
    {
      id: 1,
      invoiceNo: 'INV-001',
      customerId: 1,
      date: '2026-01-05',
      description: '',
      status: 'unpaid',
      paidAmount: 0,
      items: [{ name: 'Service', qty: 1, price: 1000 }],
    },
  ],
  '/api/supplier-payments': [
    { id: 1, supplierId: 1, amount: 50, date: '2026-01-04', reference: 'BILL-001', description: '' },
  ],
  '/api/customer-payments': [
    { id: 1, customerId: 1, amount: 300, date: '2026-01-06', reference: 'INV-001', description: '' },
  ],
  '/api/creditor-payments': [],
  '/api/debtor-receipts': [],
};

function TestConsumer({ onContext }) {
  const ctx = useApp();
  React.useEffect(() => {
    onContext(ctx);
  }, [ctx]);
  return null;
}

function renderWithProvider(onContext) {
  return render(
    React.createElement(
      AppProvider,
      null,
      React.createElement(TestConsumer, { onContext: onContext })
    )
  );
}

describe('AppContext', () => {
  let captured;

  beforeEach(() => {
    captured = null;
    global.fetch = vi.fn((url, opts) => {
      if (opts && (opts.method === 'POST' || opts.method === 'DELETE')) {
        return Promise.resolve({ json: () => Promise.resolve({}), ok: true });
      }
      const data = mockData[url] || [];
      return Promise.resolve({ json: () => Promise.resolve(data), ok: true });
    });
  });

  async function renderAndWait() {
    const capture = (ctx) => {
      captured = ctx;
    };
    renderWithProvider(capture);
    await waitFor(() => {
      expect(captured).not.toBeNull();
      expect(captured.loading).toBe(false);
    });
    return captured;
  }

  describe('pure helpers', () => {
    it('getTotal([]) returns 0', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getTotal([])).toBe(0);
    });

    it('getTotal([{qty: 3, price: 10}]) returns 30', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getTotal([{ qty: 3, price: 10 }])).toBe(30);
    });

    it('getTotal with multiple items', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getTotal([{ qty: 2, price: 100 }, { qty: 1, price: 50 }])).toBe(250);
    });

    it('getSupplierBalance returns purchases total minus payments', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getSupplierBalance(1)).toBe(200);
    });

    it('getSupplierBalance for unknown supplier returns 0', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getSupplierBalance(999)).toBe(0);
    });

    it('getCustomerBalance returns sales total minus payments', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getCustomerBalance(1)).toBe(700);
    });

    it('getCustomerBalance for unknown customer returns 0', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getCustomerBalance(999)).toBe(0);
    });

    it('getSupplier returns supplier by id', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getSupplier(1).name).toBe('Supplier A');
    });

    it('getSupplier returns undefined for unknown id', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getSupplier(999)).toBeUndefined();
    });

    it('getCustomer returns customer by id', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getCustomer(1).name).toBe('Customer A');
    });

    it('getCustomer returns undefined for unknown id', async () => {
      const ctx = await renderAndWait();
      expect(ctx.getCustomer(999)).toBeUndefined();
    });

    it("getCategoryName('income', 0) returns 'Salary'", async () => {
      const ctx = await renderAndWait();
      expect(ctx.getCategoryName('income', 0)).toBe('Salary');
    });

    it("getCategoryName('expense', 3) returns 'Entertainment'", async () => {
      const ctx = await renderAndWait();
      expect(ctx.getCategoryName('expense', 3)).toBe('Entertainment');
    });

    it('getCategoryName falls back to last category for out-of-range index', async () => {
      const ctx = await renderAndWait();
      const result = ctx.getCategoryName('expense', 999);
      expect(result).toBe('Other');
    });
  });

  describe('computed values', () => {
    it('balance equals totalIncome - totalExpense', async () => {
      const ctx = await renderAndWait();
      expect(ctx.totalIncome).toBe(5000);
      expect(ctx.totalExpense).toBe(200);
      expect(ctx.balance).toBe(4800);
    });

    it('totalPayables sums supplier balances', async () => {
      const ctx = await renderAndWait();
      expect(ctx.totalPayables).toBe(200);
    });

    it('totalReceivables sums customer balances', async () => {
      const ctx = await renderAndWait();
      expect(ctx.totalReceivables).toBe(700);
    });

    it('totalSalesAmt sums all sale item totals', async () => {
      const ctx = await renderAndWait();
      expect(ctx.totalSalesAmt).toBe(1000);
    });

    it('totalPurchasesAmt sums all purchase item totals', async () => {
      const ctx = await renderAndWait();
      expect(ctx.totalPurchasesAmt).toBe(250);
    });

    it('totalCreditorOwed sums (amount - paid) for creditors', async () => {
      const ctx = await renderAndWait();
      expect(ctx.totalCreditorOwed).toBe(800);
    });

    it('totalDebtorOwed sums (amount - received) for debtors', async () => {
      const ctx = await renderAndWait();
      expect(ctx.totalDebtorOwed).toBe(400);
    });
  });

  describe('language', () => {
    it('defaults to English', async () => {
      const ctx = await renderAndWait();
      expect(ctx.lang).toBe('en');
      expect(ctx.t.dashboard).toBe('Dashboard');
    });

    it('setLang switches to Gujarati', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setLang('gu');
      });
      await waitFor(() => {
        expect(captured.lang).toBe('gu');
      });
    });
  });

  describe('item management', () => {
    it("addItem('sale') adds an item to newSale", async () => {
      const ctx = await renderAndWait();
      expect(ctx.newSale.items).toHaveLength(1);
      await act(async () => { ctx.addItem('sale'); });
      await waitFor(() => { expect(captured.newSale.items).toHaveLength(2); });
    });

    it("addItem('purchase') adds an item to newPurchase", async () => {
      const ctx = await renderAndWait();
      expect(ctx.newPurchase.items).toHaveLength(1);
      await act(async () => { ctx.addItem('purchase'); });
      await waitFor(() => { expect(captured.newPurchase.items).toHaveLength(2); });
    });

    it("updateItem('sale', ...) updates sale item field", async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.updateItem('sale', 0, 'name', 'Widget'); });
      await waitFor(() => { expect(captured.newSale.items[0].name).toBe('Widget'); });
    });

    it("updateItem('purchase', ...) updates purchase item field", async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.updateItem('purchase', 0, 'price', 99); });
      await waitFor(() => { expect(captured.newPurchase.items[0].price).toBe(99); });
    });

    it("removeItem('sale', ...) removes sale item", async () => {
      const ctx = await renderAndWait();
      // Add a second item first
      await act(async () => { ctx.addItem('sale'); });
      await waitFor(() => { expect(captured.newSale.items).toHaveLength(2); });
      // Remove the first
      await act(async () => { captured.removeItem('sale', 0); });
      await waitFor(() => { expect(captured.newSale.items).toHaveLength(1); });
    });

    it("removeItem('purchase', ...) removes purchase item", async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.addItem('purchase'); });
      await waitFor(() => { expect(captured.newPurchase.items).toHaveLength(2); });
      await act(async () => { captured.removeItem('purchase', 0); });
      await waitFor(() => { expect(captured.newPurchase.items).toHaveLength(1); });
    });
  });

  describe('add actions', () => {
    it('addSupplierAction adds supplier and calls fetch POST', async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.setNewSupplier({ name: 'New Sup', email: 'e@e.com', phone: '123', address: 'addr' }); });
      await act(async () => { await captured.addSupplierAction(); });
      await waitFor(() => {
        expect(captured.suppliers).toHaveLength(2);
        expect(captured.suppliers[1].name).toBe('New Sup');
        expect(captured.showModal).toBeNull();
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/suppliers', expect.objectContaining({ method: 'POST' }));
    });

    it('addSupplierAction does nothing when name is empty', async () => {
      const ctx = await renderAndWait();
      const initialLen = ctx.suppliers.length;
      await act(async () => { await ctx.addSupplierAction(); });
      expect(captured.suppliers).toHaveLength(initialLen);
    });

    it('addCustomerAction adds customer and calls fetch POST', async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.setNewCustomer({ name: 'New Cust', email: '', phone: '', address: '' }); });
      await act(async () => { await captured.addCustomerAction(); });
      await waitFor(() => {
        expect(captured.customers).toHaveLength(2);
        expect(captured.customers[1].name).toBe('New Cust');
        expect(captured.showModal).toBeNull();
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/customers', expect.objectContaining({ method: 'POST' }));
    });

    it('addCustomerAction does nothing when name is empty', async () => {
      const ctx = await renderAndWait();
      const initialLen = ctx.customers.length;
      await act(async () => { await ctx.addCustomerAction(); });
      expect(captured.customers).toHaveLength(initialLen);
    });

    it('addCreditorAction adds creditor and calls fetch POST', async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.setNewCreditor({ name: 'New Cred', amount: '500', dueDate: '2026-06-01', description: 'Loan' }); });
      await act(async () => { await captured.addCreditorAction(); });
      await waitFor(() => {
        expect(captured.creditors).toHaveLength(2);
        expect(captured.creditors[1].amount).toBe(500);
        expect(captured.creditors[1].paid).toBe(0);
        expect(captured.showModal).toBeNull();
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/creditors', expect.objectContaining({ method: 'POST' }));
    });

    it('addCreditorAction does nothing when name or amount is empty', async () => {
      const ctx = await renderAndWait();
      const initialLen = ctx.creditors.length;
      await act(async () => { await ctx.addCreditorAction(); });
      expect(captured.creditors).toHaveLength(initialLen);
    });

    it('addDebtorAction adds debtor and calls fetch POST', async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.setNewDebtor({ name: 'New Debt', amount: '300', dueDate: '2026-07-01', description: 'Owed' }); });
      await act(async () => { await captured.addDebtorAction(); });
      await waitFor(() => {
        expect(captured.debtors).toHaveLength(2);
        expect(captured.debtors[1].amount).toBe(300);
        expect(captured.debtors[1].received).toBe(0);
        expect(captured.showModal).toBeNull();
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/debtors', expect.objectContaining({ method: 'POST' }));
    });

    it('addDebtorAction does nothing when name or amount is empty', async () => {
      const ctx = await renderAndWait();
      const initialLen = ctx.debtors.length;
      await act(async () => { await ctx.addDebtorAction(); });
      expect(captured.debtors).toHaveLength(initialLen);
    });

    it('addTransactionAction adds transaction and calls fetch POST', async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.setNewTx({ type: 'expense', amount: '100', category: '0', description: 'Test', date: '2026-01-10' }); });
      await act(async () => { await captured.addTransactionAction(); });
      await waitFor(() => {
        expect(captured.transactions).toHaveLength(3);
        expect(captured.transactions[2].amount).toBe(100);
        expect(captured.transactions[2].category).toBe(0);
        expect(captured.showModal).toBeNull();
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/transactions', expect.objectContaining({ method: 'POST' }));
    });

    it('addTransactionAction does nothing when amount is empty', async () => {
      const ctx = await renderAndWait();
      const initialLen = ctx.transactions.length;
      await act(async () => { await ctx.addTransactionAction(); });
      expect(captured.transactions).toHaveLength(initialLen);
    });

    it('addPurchaseAction adds purchase and calls fetch POST', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setNewPurchase({
          supplierId: '1',
          date: '2026-02-01',
          description: 'Test purchase',
          items: [{ name: 'Item1', qty: 2, price: '50' }],
        });
      });
      await act(async () => { await captured.addPurchaseAction(); });
      await waitFor(() => {
        expect(captured.purchases).toHaveLength(2);
        expect(captured.purchases[1].billNo).toBe('BILL-002');
        expect(captured.purchases[1].items[0].price).toBe(50);
        expect(captured.showModal).toBeNull();
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/purchases', expect.objectContaining({ method: 'POST' }));
    });

    it('addPurchaseAction does nothing when supplierId is empty', async () => {
      const ctx = await renderAndWait();
      const initialLen = ctx.purchases.length;
      await act(async () => { await ctx.addPurchaseAction(); });
      expect(captured.purchases).toHaveLength(initialLen);
    });

    it('addPurchaseAction does nothing when item name is empty', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setNewPurchase({
          supplierId: '1',
          date: '2026-02-01',
          description: '',
          items: [{ name: '', qty: 1, price: '10' }],
        });
      });
      const initialLen = ctx.purchases.length;
      await act(async () => { await captured.addPurchaseAction(); });
      expect(captured.purchases).toHaveLength(initialLen);
    });

    it('addSaleAction adds sale and calls fetch POST', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setNewSale({
          customerId: '1',
          date: '2026-02-05',
          description: 'Test sale',
          items: [{ name: 'Product', qty: 3, price: '200' }],
        });
      });
      await act(async () => { await captured.addSaleAction(); });
      await waitFor(() => {
        expect(captured.sales).toHaveLength(2);
        expect(captured.sales[1].invoiceNo).toBe('INV-002');
        expect(captured.sales[1].items[0].price).toBe(200);
        expect(captured.showModal).toBeNull();
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/sales', expect.objectContaining({ method: 'POST' }));
    });

    it('addSaleAction does nothing when customerId is empty', async () => {
      const ctx = await renderAndWait();
      const initialLen = ctx.sales.length;
      await act(async () => { await ctx.addSaleAction(); });
      expect(captured.sales).toHaveLength(initialLen);
    });

    it('addSaleAction does nothing when item price is empty', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setNewSale({
          customerId: '1',
          date: '2026-02-05',
          description: '',
          items: [{ name: 'Product', qty: 1, price: '' }],
        });
      });
      const initialLen = ctx.sales.length;
      await act(async () => { await captured.addSaleAction(); });
      expect(captured.sales).toHaveLength(initialLen);
    });
  });

  describe('delete actions', () => {
    it('deleteTransaction calls fetch DELETE and removes from state', async () => {
      const ctx = await renderAndWait();
      expect(ctx.transactions).toHaveLength(2);
      await act(async () => { await ctx.deleteTransaction(1); });
      await waitFor(() => {
        expect(captured.transactions).toHaveLength(1);
        expect(captured.transactions.find((t) => t.id === 1)).toBeUndefined();
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/transactions/1', { method: 'DELETE' });
    });

    it('deleteCreditor calls fetch DELETE and removes from state', async () => {
      const ctx = await renderAndWait();
      expect(ctx.creditors).toHaveLength(1);
      await act(async () => { await ctx.deleteCreditor(1); });
      await waitFor(() => { expect(captured.creditors).toHaveLength(0); });
      expect(global.fetch).toHaveBeenCalledWith('/api/creditors/1', { method: 'DELETE' });
    });

    it('deleteDebtor calls fetch DELETE and removes from state', async () => {
      const ctx = await renderAndWait();
      expect(ctx.debtors).toHaveLength(1);
      await act(async () => { await ctx.deleteDebtor(1); });
      await waitFor(() => { expect(captured.debtors).toHaveLength(0); });
      expect(global.fetch).toHaveBeenCalledWith('/api/debtors/1', { method: 'DELETE' });
    });
  });

  describe('makePaymentAction', () => {
    it('makes supplier payment and updates state', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'supplier', id: 1, name: 'Supplier A', billNo: 'BILL-001' });
        ctx.setPaymentAmount('100');
        ctx.setPaymentDesc('Supplier payment');
        ctx.setPaymentDate('2026-02-01');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        expect(captured.paymentModal).toBeNull();
        expect(captured.supplierPayments).toHaveLength(2);
        expect(captured.transactions.length).toBeGreaterThan(2);
        // Purchase should now be partially paid
        const purchase = captured.purchases.find(p => p.billNo === 'BILL-001');
        expect(purchase.paidAmount).toBe(100);
        expect(purchase.status).toBe('partial');
      });
      expect(global.fetch).toHaveBeenCalledWith('/api/payments', expect.objectContaining({ method: 'POST' }));
    });

    it('makes supplier payment that fully pays bill', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'supplier', id: 1, name: 'Supplier A', billNo: 'BILL-001' });
        ctx.setPaymentAmount('250'); // Full amount (10 * 25 = 250)
        ctx.setPaymentDesc('Full payment');
        ctx.setPaymentDate('2026-02-01');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        const purchase = captured.purchases.find(p => p.billNo === 'BILL-001');
        expect(purchase.status).toBe('paid');
      });
    });

    it('makes supplier payment without billNo (direct payment)', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'supplier', id: 1, name: 'Supplier A' });
        ctx.setPaymentAmount('50');
        ctx.setPaymentDesc('');
        ctx.setPaymentDate('2026-02-01');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        expect(captured.paymentModal).toBeNull();
        expect(captured.supplierPayments).toHaveLength(2);
        expect(captured.supplierPayments[1].reference).toBe('Direct');
      });
    });

    it('makes customer payment and updates state', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'customer', id: 1, name: 'Customer A', invoiceNo: 'INV-001' });
        ctx.setPaymentAmount('500');
        ctx.setPaymentDesc('Customer receipt');
        ctx.setPaymentDate('2026-02-05');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        expect(captured.paymentModal).toBeNull();
        expect(captured.customerPayments).toHaveLength(2);
        // Sale should be partially paid
        const sale = captured.sales.find(s => s.invoiceNo === 'INV-001');
        expect(sale.paidAmount).toBe(500);
        expect(sale.status).toBe('partial');
      });
    });

    it('makes customer payment that fully pays invoice', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'customer', id: 1, name: 'Customer A', invoiceNo: 'INV-001' });
        ctx.setPaymentAmount('1000'); // Full amount
        ctx.setPaymentDesc('Full receipt');
        ctx.setPaymentDate('2026-02-05');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        const sale = captured.sales.find(s => s.invoiceNo === 'INV-001');
        expect(sale.status).toBe('paid');
      });
    });

    it('makes customer payment without invoiceNo (direct payment)', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'customer', id: 1, name: 'Customer A' });
        ctx.setPaymentAmount('200');
        ctx.setPaymentDesc('');
        ctx.setPaymentDate('2026-02-05');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        expect(captured.paymentModal).toBeNull();
        expect(captured.customerPayments).toHaveLength(2);
        expect(captured.customerPayments[1].reference).toBe('Direct');
      });
    });

    it('makes creditor payment and updates state', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'creditor', id: 1, name: 'Creditor A' });
        ctx.setPaymentAmount('300');
        ctx.setPaymentDesc('Creditor payment');
        ctx.setPaymentDate('2026-03-01');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        expect(captured.paymentModal).toBeNull();
        expect(captured.creditorPayments).toHaveLength(1);
        // Creditor paid amount should increase
        const creditor = captured.creditors.find(c => c.id === 1);
        expect(creditor.paid).toBe(500); // 200 + 300
      });
    });

    it('makes debtor receipt and updates state', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'debtor', id: 1, name: 'Debtor A' });
        ctx.setPaymentAmount('200');
        ctx.setPaymentDesc('Debtor receipt');
        ctx.setPaymentDate('2026-03-05');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        expect(captured.paymentModal).toBeNull();
        expect(captured.debtorReceipts).toHaveLength(1);
        // Debtor received amount should increase
        const debtor = captured.debtors.find(d => d.id === 1);
        expect(debtor.received).toBe(300); // 100 + 200
      });
    });

    it('does nothing when paymentAmount is empty', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'supplier', id: 1, name: 'Supplier A' });
        ctx.setPaymentAmount('');
      });
      await act(async () => { await captured.makePaymentAction(); });
      // paymentModal should still be set (not cleared)
      await waitFor(() => { expect(captured.paymentModal).not.toBeNull(); });
    });

    it('does nothing when paymentModal is null', async () => {
      const ctx = await renderAndWait();
      await act(async () => { ctx.setPaymentAmount('100'); });
      await act(async () => { await captured.makePaymentAction(); });
      // No crash, no new transactions
      expect(captured.transactions).toHaveLength(2);
    });

    it('uses default payment description for supplier when desc is empty', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'supplier', id: 1, name: 'Supplier A' });
        ctx.setPaymentAmount('50');
        ctx.setPaymentDesc('');
        ctx.setPaymentDate('2026-02-01');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        // Transaction description should use default template
        const newTx = captured.transactions.find(t => t.type === 'expense' && t.category === 6);
        expect(newTx).toBeTruthy();
        expect(newTx.description).toContain('Supplier A');
      });
    });

    it('uses default payment description for customer when desc is empty', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'customer', id: 1, name: 'Customer A' });
        ctx.setPaymentAmount('50');
        ctx.setPaymentDesc('');
        ctx.setPaymentDate('2026-02-01');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        const newTx = captured.transactions.find(t => t.type === 'income' && t.category === 3);
        expect(newTx).toBeTruthy();
        expect(newTx.description).toContain('Customer A');
      });
    });

    it('resets payment form state after successful payment', async () => {
      const ctx = await renderAndWait();
      await act(async () => {
        ctx.setPaymentModal({ type: 'supplier', id: 1, name: 'Supplier A' });
        ctx.setPaymentAmount('100');
        ctx.setPaymentDesc('Test');
        ctx.setPaymentDate('2026-02-01');
      });
      await act(async () => { await captured.makePaymentAction(); });
      await waitFor(() => {
        expect(captured.paymentModal).toBeNull();
        expect(captured.paymentAmount).toBe('');
        expect(captured.paymentDesc).toBe('');
      });
    });
  });

  describe('modal management', () => {
    it('setShowModal opens and closes modals', async () => {
      const ctx = await renderAndWait();
      expect(ctx.showModal).toBeNull();
      await act(async () => { ctx.setShowModal('supplier'); });
      await waitFor(() => { expect(captured.showModal).toBe('supplier'); });
      await act(async () => { captured.setShowModal(null); });
      await waitFor(() => { expect(captured.showModal).toBeNull(); });
    });

    it('setPaymentModal opens and closes payment modal', async () => {
      const ctx = await renderAndWait();
      expect(ctx.paymentModal).toBeNull();
      await act(async () => { ctx.setPaymentModal({ type: 'supplier', id: 1, name: 'Test' }); });
      await waitFor(() => { expect(captured.paymentModal).not.toBeNull(); });
      await act(async () => { captured.setPaymentModal(null); });
      await waitFor(() => { expect(captured.paymentModal).toBeNull(); });
    });
  });

  describe('useApp outside provider', () => {
    it('throws error when used outside AppProvider', () => {
      function BadConsumer() {
        useApp();
        return null;
      }
      expect(() => render(React.createElement(BadConsumer))).toThrow('useApp must be used within AppProvider');
    });
  });
});
