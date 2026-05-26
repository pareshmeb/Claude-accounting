/**
 * Tests for simple CRUD API routes.
 * All routes import db from '@/lib/db', so we mock it.
 */

// Mock db before any imports
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

function makeParams(id) {
  return { params: Promise.resolve({ id: String(id) }) };
}

describe('API Routes - Suppliers', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all suppliers', async () => {
    const { GET } = await import('@/app/api/suppliers/route.js');
    const mockRows = [{ id: 1, name: 'Supplier A' }];
    mockAll.mockReturnValueOnce(mockRows);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual(mockRows);
    expect(mockPrepare).toHaveBeenCalledWith('SELECT * FROM suppliers ORDER BY id');
  });

  it('POST creates a supplier', async () => {
    const { POST } = await import('@/app/api/suppliers/route.js');
    const body = { id: 1, name: 'Sup', email: 'e', phone: 'p', address: 'a' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json).toEqual(body);
    expect(res.status).toBe(201);
    expect(mockRun).toHaveBeenCalledWith(1, 'Sup', 'e', 'p', 'a');
  });
});

describe('API Routes - Customers', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all customers', async () => {
    const { GET } = await import('@/app/api/customers/route.js');
    const mockRows = [{ id: 1, name: 'Customer A' }];
    mockAll.mockReturnValueOnce(mockRows);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual(mockRows);
  });

  it('POST creates a customer', async () => {
    const { POST } = await import('@/app/api/customers/route.js');
    const body = { id: 2, name: 'Cust', email: 'e', phone: 'p', address: 'a' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json).toEqual(body);
    expect(res.status).toBe(201);
  });
});

describe('API Routes - Creditors', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all creditors', async () => {
    const { GET } = await import('@/app/api/creditors/route.js');
    mockAll.mockReturnValueOnce([{ id: 1, name: 'Cred' }]);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([{ id: 1, name: 'Cred' }]);
  });

  it('POST creates a creditor', async () => {
    const { POST } = await import('@/app/api/creditors/route.js');
    const body = { id: 3, name: 'Cred', amount: 1000, dueDate: '2026-06-01', description: 'Loan' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json.name).toBe('Cred');
    expect(json.paid).toBe(0);
    expect(res.status).toBe(201);
  });
});

describe('API Routes - Creditors [id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('PUT updates creditor paid amount', async () => {
    const { PUT } = await import('@/app/api/creditors/[id]/route.js');
    mockGet.mockReturnValueOnce({ id: 1, name: 'Cred', paid: 200 });
    const res = await PUT(makeRequest({ paid: 500 }), makeParams(1));
    const json = await res.json();
    expect(json.paid).toBe(500);
    expect(mockRun).toHaveBeenCalled();
  });

  it('PUT returns 404 when creditor not found', async () => {
    const { PUT } = await import('@/app/api/creditors/[id]/route.js');
    mockGet.mockReturnValueOnce(null);
    const res = await PUT(makeRequest({ paid: 500 }), makeParams(999));
    expect(res.status).toBe(404);
  });

  it('DELETE removes a creditor', async () => {
    const { DELETE } = await import('@/app/api/creditors/[id]/route.js');
    const res = await DELETE({}, makeParams(1));
    const json = await res.json();
    expect(json).toEqual({ success: true });
    expect(mockRun).toHaveBeenCalledWith(1);
  });
});

describe('API Routes - Debtors', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all debtors', async () => {
    const { GET } = await import('@/app/api/debtors/route.js');
    mockAll.mockReturnValueOnce([{ id: 1, name: 'Debtor' }]);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([{ id: 1, name: 'Debtor' }]);
  });

  it('POST creates a debtor', async () => {
    const { POST } = await import('@/app/api/debtors/route.js');
    const body = { id: 4, name: 'Debt', amount: 500, dueDate: '2026-07-01', description: 'Owed' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json.name).toBe('Debt');
    expect(json.received).toBe(0);
    expect(res.status).toBe(201);
  });
});

describe('API Routes - Debtors [id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('PUT updates debtor received amount', async () => {
    const { PUT } = await import('@/app/api/debtors/[id]/route.js');
    mockGet.mockReturnValueOnce({ id: 1, name: 'Debt', received: 100 });
    const res = await PUT(makeRequest({ received: 300 }), makeParams(1));
    const json = await res.json();
    expect(json.received).toBe(300);
  });

  it('PUT returns 404 when debtor not found', async () => {
    const { PUT } = await import('@/app/api/debtors/[id]/route.js');
    mockGet.mockReturnValueOnce(null);
    const res = await PUT(makeRequest({ received: 300 }), makeParams(999));
    expect(res.status).toBe(404);
  });

  it('DELETE removes a debtor', async () => {
    const { DELETE } = await import('@/app/api/debtors/[id]/route.js');
    const res = await DELETE({}, makeParams(1));
    const json = await res.json();
    expect(json).toEqual({ success: true });
  });
});

describe('API Routes - Transactions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all transactions', async () => {
    const { GET } = await import('@/app/api/transactions/route.js');
    mockAll.mockReturnValueOnce([{ id: 1, type: 'income', amount: 5000 }]);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([{ id: 1, type: 'income', amount: 5000 }]);
  });

  it('POST creates a transaction', async () => {
    const { POST } = await import('@/app/api/transactions/route.js');
    const body = { id: 10, type: 'expense', amount: 100, category: 0, description: 'Food', date: '2026-01-01' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json).toEqual(body);
    expect(res.status).toBe(201);
  });
});

describe('API Routes - Transactions [id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('DELETE removes a transaction', async () => {
    const { DELETE } = await import('@/app/api/transactions/[id]/route.js');
    const res = await DELETE({}, makeParams(1));
    const json = await res.json();
    expect(json).toEqual({ success: true });
    expect(mockRun).toHaveBeenCalledWith(1);
  });
});

describe('API Routes - Supplier Payments', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all supplier payments', async () => {
    const { GET } = await import('@/app/api/supplier-payments/route.js');
    mockAll.mockReturnValueOnce([{ id: 1, supplierId: 1, amount: 50 }]);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([{ id: 1, supplierId: 1, amount: 50 }]);
  });

  it('POST creates a supplier payment', async () => {
    const { POST } = await import('@/app/api/supplier-payments/route.js');
    const body = { id: 5, supplierId: 1, amount: 100, date: '2026-01-10', reference: 'REF', description: 'Pay' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json).toEqual(body);
    expect(res.status).toBe(201);
  });
});

describe('API Routes - Customer Payments', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all customer payments', async () => {
    const { GET } = await import('@/app/api/customer-payments/route.js');
    mockAll.mockReturnValueOnce([{ id: 1, customerId: 1, amount: 300 }]);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([{ id: 1, customerId: 1, amount: 300 }]);
  });

  it('POST creates a customer payment', async () => {
    const { POST } = await import('@/app/api/customer-payments/route.js');
    const body = { id: 6, customerId: 1, amount: 200, date: '2026-01-11', reference: 'REF', description: 'Rec' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json).toEqual(body);
    expect(res.status).toBe(201);
  });
});

describe('API Routes - Creditor Payments', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all creditor payments', async () => {
    const { GET } = await import('@/app/api/creditor-payments/route.js');
    mockAll.mockReturnValueOnce([]);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it('POST creates a creditor payment', async () => {
    const { POST } = await import('@/app/api/creditor-payments/route.js');
    const body = { id: 7, creditorId: 1, amount: 500, date: '2026-02-01', description: 'Installment' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json).toEqual(body);
    expect(res.status).toBe(201);
  });
});

describe('API Routes - Debtor Receipts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns all debtor receipts', async () => {
    const { GET } = await import('@/app/api/debtor-receipts/route.js');
    mockAll.mockReturnValueOnce([]);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([]);
  });

  it('POST creates a debtor receipt', async () => {
    const { POST } = await import('@/app/api/debtor-receipts/route.js');
    const body = { id: 8, debtorId: 1, amount: 100, date: '2026-02-05', description: 'Receipt' };
    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json).toEqual(body);
    expect(res.status).toBe(201);
  });
});
