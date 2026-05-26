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
