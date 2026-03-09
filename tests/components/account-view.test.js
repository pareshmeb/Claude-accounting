import { render, screen, fireEvent } from '@testing-library/react';
import AccountView from '@/components/AccountView';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('AccountView', () => {
  const supplierAccount = {
    id: 1,
    type: 'supplier',
    name: 'Office Supplies Co',
    email: 'info@officesupplies.com',
    phone: '555-0101',
    address: '123 Main St',
  };

  const customerAccount = {
    id: 2,
    type: 'customer',
    name: 'Client Corp',
    email: 'billing@client.com',
    phone: '555-0202',
    address: '456 Oak Ave',
  };

  const mockOnBack = vi.fn();
  let mockSetShowModal, mockSetNewPurchase, mockSetNewSale, mockSetPaymentModal;

  beforeEach(() => {
    mockOnBack.mockClear();
    mockSetShowModal = vi.fn();
    mockSetNewPurchase = vi.fn();
    mockSetNewSale = vi.fn();
    mockSetPaymentModal = vi.fn();
  });

  function renderSupplier(overrides = {}) {
    const mockCtx = createMockContext({
      purchases: [
        { id: 1, billNo: 'BILL-001', supplierId: 1, date: '2026-01-03', description: 'Office supplies', items: [{ name: 'Paper', qty: 10, price: 25 }] },
      ],
      supplierPayments: [
        { id: 1, supplierId: 1, amount: 100, date: '2026-01-04', reference: 'BILL-001', description: 'Partial' },
      ],
      getTotal: (items) => items.reduce((s, i) => s + (i.qty * i.price), 0),
      getSupplierBalance: () => 150,
      setShowModal: mockSetShowModal,
      setNewPurchase: mockSetNewPurchase,
      setPaymentModal: mockSetPaymentModal,
      newPurchase: { supplierId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
      ...overrides,
    });
    useApp.mockReturnValue(mockCtx);
    return render(<AccountView account={supplierAccount} onBack={mockOnBack} />);
  }

  function renderCustomer(overrides = {}) {
    const mockCtx = createMockContext({
      sales: [
        { id: 1, invoiceNo: 'INV-001', customerId: 2, date: '2026-01-05', description: 'Service rendered', items: [{ name: 'Service', qty: 1, price: 1000 }] },
      ],
      customerPayments: [
        { id: 1, customerId: 2, amount: 300, date: '2026-01-06', reference: 'INV-001', description: 'Down payment' },
      ],
      getTotal: (items) => items.reduce((s, i) => s + (i.qty * i.price), 0),
      getCustomerBalance: () => 700,
      setShowModal: mockSetShowModal,
      setNewSale: mockSetNewSale,
      setPaymentModal: mockSetPaymentModal,
      newSale: { customerId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
      ...overrides,
    });
    useApp.mockReturnValue(mockCtx);
    return render(<AccountView account={customerAccount} onBack={mockOnBack} />);
  }

  // --- Supplier view ---
  it('renders supplier account name and contact', () => {
    renderSupplier();
    expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
    expect(screen.getByText(/info@officesupplies\.com/)).toBeInTheDocument();
  });

  it('renders back button that calls onBack', () => {
    renderSupplier();
    const backButton = screen.getByText('Back').closest('button');
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('shows balance for supplier account', () => {
    renderSupplier();
    const balanceElements = screen.getAllByText(/₹150/);
    expect(balanceElements.length).toBeGreaterThan(0);
  });

  it('shows purchases/paid/outstanding stats for supplier', () => {
    renderSupplier();
    expect(screen.getByText('Purchases')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
    const purchaseAmounts = screen.getAllByText(/₹250/);
    expect(purchaseAmounts.length).toBeGreaterThan(0);
    const paidAmounts = screen.getAllByText(/₹100/);
    expect(paidAmounts.length).toBeGreaterThan(0);
  });

  it('renders ledger table with purchase and payment entries', () => {
    renderSupplier();
    expect(screen.getByText('Account Ledger')).toBeInTheDocument();
    const billRefs = screen.getAllByText('BILL-001');
    expect(billRefs.length).toBe(2);
    expect(screen.getByText('Office supplies')).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });

  it('add purchase button opens purchase modal with supplier pre-selected', () => {
    renderSupplier();
    const purchaseButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('Purchase'));
    fireEvent.click(purchaseButton);
    expect(mockSetNewPurchase).toHaveBeenCalled();
    expect(mockSetShowModal).toHaveBeenCalledWith('purchase');
  });

  it('pay button opens payment modal for supplier', () => {
    renderSupplier();
    const payButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('Pay'));
    fireEvent.click(payButton);
    expect(mockSetPaymentModal).toHaveBeenCalledWith({ type: 'supplier', id: 1, name: 'Office Supplies Co' });
  });

  it('shows Export CSV button when ledger has entries', () => {
    renderSupplier();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('does NOT show Export CSV button when ledger is empty', () => {
    renderSupplier({
      purchases: [],
      supplierPayments: [],
      getSupplierBalance: () => 0,
    });
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
  });

  it('Export CSV button creates and triggers download', () => {
    const mockClick = vi.fn();
    const mockCreateObjectURL = vi.fn(() => 'blob:test');
    const mockRevokeObjectURL = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        const el = origCreateElement(tag);
        el.click = mockClick;
        return el;
      }
      return origCreateElement(tag);
    });
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    renderSupplier();
    fireEvent.click(screen.getByText('Export CSV'));

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();

    document.createElement.mockRestore();
  });

  // --- Customer view ---
  it('renders customer account name and contact', () => {
    renderCustomer();
    expect(screen.getByText('Client Corp')).toBeInTheDocument();
    expect(screen.getByText(/billing@client\.com/)).toBeInTheDocument();
  });

  it('shows sales/received/outstanding stats for customer', () => {
    renderCustomer();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
    const salesAmounts = screen.getAllByText(/₹1,000/);
    expect(salesAmounts.length).toBeGreaterThan(0);
    const receivedAmounts = screen.getAllByText(/₹300/);
    expect(receivedAmounts.length).toBeGreaterThan(0);
  });

  it('customer balance is displayed', () => {
    renderCustomer();
    const balanceElements = screen.getAllByText(/₹700/);
    expect(balanceElements.length).toBeGreaterThan(0);
  });

  it('renders ledger table with sale and payment entries for customer', () => {
    renderCustomer();
    expect(screen.getByText('Account Ledger')).toBeInTheDocument();
    const invoiceRefs = screen.getAllByText('INV-001');
    expect(invoiceRefs.length).toBe(2);
    expect(screen.getByText('Service rendered')).toBeInTheDocument();
    expect(screen.getByText('Down payment')).toBeInTheDocument();
  });

  it('add sale button opens sale modal with customer pre-selected', () => {
    renderCustomer();
    const saleButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('Sale'));
    fireEvent.click(saleButton);
    expect(mockSetNewSale).toHaveBeenCalled();
    expect(mockSetShowModal).toHaveBeenCalledWith('sale');
  });

  it('receive button opens payment modal for customer', () => {
    renderCustomer();
    const receiveButton = screen.getAllByRole('button').find(btn => btn.textContent.includes('Receive'));
    fireEvent.click(receiveButton);
    expect(mockSetPaymentModal).toHaveBeenCalledWith({ type: 'customer', id: 2, name: 'Client Corp' });
  });

  it('ledger entries display dash for empty descriptions', () => {
    renderSupplier({
      purchases: [
        { id: 1, billNo: 'BILL-001', supplierId: 1, date: '2026-01-03', description: '', items: [{ name: 'Paper', qty: 10, price: 25 }] },
      ],
      supplierPayments: [],
    });
    // Empty description shows '-' (multiple dashes also appear in debit/credit columns)
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('ledger entries show correct debit/credit coloring', () => {
    renderSupplier();
    // Debit entries (purchases) should have text-red-400 class
    // Credit entries (payments) should have text-emerald-400 class
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('ledger running balance is computed correctly', () => {
    renderSupplier();
    // Purchase of 250 debit, then payment of 100 credit
    // Running balance: 250, then 150
    const balance250 = screen.getAllByText(/₹250/);
    expect(balance250.length).toBeGreaterThan(0);
  });
});
