/**
 * Tests for the complex payments API route.
 * Handles supplier, customer, creditor, and debtor payments with transactions.
 */

const mockRun = vi.fn();
const mockAll = vi.fn(() => []);
const mockGet = vi.fn(() => null);
const mockPrepare = vi.fn(() => ({ run: mockRun, all: mockAll, get: mockGet }));
const mockTransaction = vi.fn((fn) => fn);
const mockExec = vi.fn();
const mockPragma = vi.fn();

vi.mock('@/lib/db', () => ({
  default: {
    prepare: mockPrepare,
    transaction: mockTransaction,
    exec: mockExec,
    pragma: mockPragma,
  },
}));

function makeRequest(body) {
  return { json: () => Promise.resolve(body) };
}

describe('API Routes - Payments', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POST supplier payment creates transaction and supplier payment', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    const body = {
      type: 'supplier', id: 1, amount: 100, date: '2026-02-01',
      description: 'Test', reference: 'BILL-001',
      transactionId: 999, transactionType: 'expense',
      transactionCategory: 6, transactionDescription: 'Payment to Supplier A',
    };

    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json).toEqual({ success: true });
    expect(mockTransaction).toHaveBeenCalled();
    // Multiple db.prepare calls: insert transaction + insert supplier_payment
    expect(mockPrepare).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalled();
  });

  it('POST supplier payment with billNo updates purchase status', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    // Mock: purchase found with items
    mockGet.mockReturnValueOnce({ id: 1, billNo: 'BILL-001', paidAmount: 0 });
    mockAll.mockReturnValueOnce([{ qty: 10, price: 25 }]); // items total = 250

    const body = {
      type: 'supplier', id: 1, amount: 250, date: '2026-02-01',
      description: '', reference: 'REF', billNo: 'BILL-001',
      transactionId: 1000, transactionType: 'expense',
      transactionCategory: 6, transactionDescription: 'Pay',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
    // Should have called UPDATE purchases with 'paid' status
    expect(mockRun).toHaveBeenCalled();
  });

  it('POST supplier payment with billNo where purchase not found', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    mockGet.mockReturnValueOnce(null); // purchase not found

    const body = {
      type: 'supplier', id: 1, amount: 100, date: '2026-02-01',
      description: '', reference: 'REF', billNo: 'BILL-NONEXISTENT',
      transactionId: 1001, transactionType: 'expense',
      transactionCategory: 6, transactionDescription: 'Pay',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
    // Should still succeed, just no purchase update
  });

  it('POST supplier payment without billNo (direct)', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    const body = {
      type: 'supplier', id: 1, amount: 50, date: '2026-02-01',
      description: '', reference: 'Direct',
      transactionId: 1002, transactionType: 'expense',
      transactionCategory: 6, transactionDescription: 'Direct pay',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
  });

  it('POST customer payment creates transaction and customer payment', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    const body = {
      type: 'customer', id: 1, amount: 500, date: '2026-02-05',
      description: 'Receipt', reference: 'INV-001',
      transactionId: 1003, transactionType: 'income',
      transactionCategory: 3, transactionDescription: 'Receipt from Customer A',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
    expect(mockTransaction).toHaveBeenCalled();
  });

  it('POST customer payment with invoiceNo updates sale status', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    mockGet.mockReturnValueOnce({ id: 1, invoiceNo: 'INV-001', paidAmount: 0 });
    mockAll.mockReturnValueOnce([{ qty: 1, price: 1000 }]); // items total = 1000

    const body = {
      type: 'customer', id: 1, amount: 500, date: '2026-02-05',
      description: '', reference: 'REF', invoiceNo: 'INV-001',
      transactionId: 1004, transactionType: 'income',
      transactionCategory: 3, transactionDescription: 'Rec',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
    // Should update sale to 'partial' (500 < 1000)
    expect(mockRun).toHaveBeenCalled();
  });

  it('POST customer payment with invoiceNo where sale not found', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    mockGet.mockReturnValueOnce(null); // sale not found

    const body = {
      type: 'customer', id: 1, amount: 100, date: '2026-02-05',
      description: '', reference: 'REF', invoiceNo: 'INV-NONEXISTENT',
      transactionId: 1005, transactionType: 'income',
      transactionCategory: 3, transactionDescription: 'Rec',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
  });

  it('POST customer payment without invoiceNo (direct)', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    const body = {
      type: 'customer', id: 1, amount: 200, date: '2026-02-05',
      description: '', reference: 'Direct',
      transactionId: 1006, transactionType: 'income',
      transactionCategory: 3, transactionDescription: 'Direct receipt',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
  });

  it('POST creditor payment creates transaction and updates creditor', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    const body = {
      type: 'creditor', id: 1, amount: 300, date: '2026-03-01',
      description: 'Installment',
      transactionId: 1007, transactionType: 'expense',
      transactionCategory: 7, transactionDescription: 'Creditor pay',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
    // Should have inserted creditor_payment and updated creditor.paid
    expect(mockRun).toHaveBeenCalled();
  });

  it('POST debtor receipt creates transaction and updates debtor', async () => {
    const { POST } = await import('@/app/api/payments/route.js');
    const body = {
      type: 'debtor', id: 1, amount: 200, date: '2026-03-05',
      description: 'Repayment',
      transactionId: 1008, transactionType: 'income',
      transactionCategory: 4, transactionDescription: 'Debtor receipt',
    };

    const res = await POST(makeRequest(body));
    expect(res.status).toBe(201);
    // Should have inserted debtor_receipt and updated debtor.received
    expect(mockRun).toHaveBeenCalled();
  });
});
