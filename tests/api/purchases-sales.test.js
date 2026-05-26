/**
 * Tests for purchases and sales API routes (with items and transactions).
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

function makeParams(id) {
  return { params: Promise.resolve({ id: String(id) }) };
}

describe('API Routes - Purchases', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns purchases with items joined', async () => {
    const { GET } = await import('@/app/api/purchases/route.js');
    const purchases = [{ id: 1, billNo: 'BILL-001', supplierId: 1 }];
    const items = [{ id: 10, purchaseId: 1, name: 'Paper', qty: 10, price: 25 }];
    mockAll.mockReturnValueOnce(purchases).mockReturnValueOnce(items);

    const res = await GET();
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].items).toHaveLength(1);
    expect(json[0].items[0]).toEqual({ name: 'Paper', qty: 10, price: 25 });
    // id and purchaseId should be stripped from items
    expect(json[0].items[0].id).toBeUndefined();
    expect(json[0].items[0].purchaseId).toBeUndefined();
  });

  it('POST creates a purchase with items in a transaction', async () => {
    const { POST } = await import('@/app/api/purchases/route.js');
    const body = {
      id: 100, billNo: 'BILL-010', supplierId: 1, date: '2026-03-01',
      description: 'Test', items: [{ name: 'Pen', qty: 5, price: 10 }],
    };

    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.billNo).toBe('BILL-010');
    expect(json.status).toBe('unpaid');
    expect(json.paidAmount).toBe(0);
    expect(mockTransaction).toHaveBeenCalled();
    // Should have called prepare for insert purchase and insert items
    expect(mockRun).toHaveBeenCalled();
  });

  it('POST defaults status to unpaid and paidAmount to 0', async () => {
    const { POST } = await import('@/app/api/purchases/route.js');
    const body = {
      id: 101, billNo: 'BILL-011', supplierId: 1, date: '2026-03-01',
      description: '', items: [{ name: 'Item', qty: 1, price: 100 }],
    };

    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(json.status).toBe('unpaid');
    expect(json.paidAmount).toBe(0);
  });
});

describe('API Routes - Purchases [id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('PUT updates purchase status and paidAmount', async () => {
    const { PUT } = await import('@/app/api/purchases/[id]/route.js');
    mockGet.mockReturnValueOnce({ id: 1, billNo: 'BILL-001', status: 'unpaid', paidAmount: 0 });

    const res = await PUT(makeRequest({ status: 'paid', paidAmount: 250 }), makeParams(1));
    const json = await res.json();
    expect(json.status).toBe('paid');
    expect(json.paidAmount).toBe(250);
    expect(mockRun).toHaveBeenCalled();
  });

  it('PUT preserves existing values when not provided', async () => {
    const { PUT } = await import('@/app/api/purchases/[id]/route.js');
    mockGet.mockReturnValueOnce({ id: 1, billNo: 'BILL-001', status: 'partial', paidAmount: 100 });

    const res = await PUT(makeRequest({}), makeParams(1));
    const json = await res.json();
    expect(json.status).toBe('partial');
    expect(json.paidAmount).toBe(100);
  });

  it('PUT returns 404 when purchase not found', async () => {
    const { PUT } = await import('@/app/api/purchases/[id]/route.js');
    mockGet.mockReturnValueOnce(null);

    const res = await PUT(makeRequest({ status: 'paid' }), makeParams(999));
    expect(res.status).toBe(404);
  });
});

describe('API Routes - Sales', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET returns sales with items joined', async () => {
    const { GET } = await import('@/app/api/sales/route.js');
    const salesRows = [{ id: 1, invoiceNo: 'INV-001', customerId: 1 }];
    const items = [{ id: 20, saleId: 1, name: 'Service', qty: 1, price: 1000 }];
    mockAll.mockReturnValueOnce(salesRows).mockReturnValueOnce(items);

    const res = await GET();
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].items).toHaveLength(1);
    expect(json[0].items[0]).toEqual({ name: 'Service', qty: 1, price: 1000 });
    expect(json[0].items[0].id).toBeUndefined();
    expect(json[0].items[0].saleId).toBeUndefined();
  });

  it('POST creates a sale with items in a transaction', async () => {
    const { POST } = await import('@/app/api/sales/route.js');
    const body = {
      id: 200, invoiceNo: 'INV-010', customerId: 1, date: '2026-03-05',
      description: 'Test', items: [{ name: 'Product', qty: 3, price: 200 }],
    };

    const res = await POST(makeRequest(body));
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.invoiceNo).toBe('INV-010');
    expect(json.status).toBe('unpaid');
    expect(json.paidAmount).toBe(0);
    expect(mockTransaction).toHaveBeenCalled();
  });
});

describe('API Routes - Sales [id]', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('PUT updates sale status and paidAmount', async () => {
    const { PUT } = await import('@/app/api/sales/[id]/route.js');
    mockGet.mockReturnValueOnce({ id: 1, invoiceNo: 'INV-001', status: 'unpaid', paidAmount: 0 });

    const res = await PUT(makeRequest({ status: 'paid', paidAmount: 1000 }), makeParams(1));
    const json = await res.json();
    expect(json.status).toBe('paid');
    expect(json.paidAmount).toBe(1000);
  });

  it('PUT preserves existing values when not provided', async () => {
    const { PUT } = await import('@/app/api/sales/[id]/route.js');
    mockGet.mockReturnValueOnce({ id: 1, invoiceNo: 'INV-001', status: 'partial', paidAmount: 500 });

    const res = await PUT(makeRequest({}), makeParams(1));
    const json = await res.json();
    expect(json.status).toBe('partial');
    expect(json.paidAmount).toBe(500);
  });

  it('PUT returns 404 when sale not found', async () => {
    const { PUT } = await import('@/app/api/sales/[id]/route.js');
    mockGet.mockReturnValueOnce(null);

    const res = await PUT(makeRequest({ status: 'paid' }), makeParams(999));
    expect(res.status).toBe(404);
  });
});
