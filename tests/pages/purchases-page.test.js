import { render, screen, fireEvent } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import PurchasesPage from '@/app/purchases/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => '/purchases'),
}));

vi.mock('@/components/StatusBadge', () => ({
  default: ({ status }) => <span data-testid="status-badge">{status}</span>,
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    purchases: [
      { id: 1, billNo: 'BILL-001', supplierId: 1, date: '2026-01-03', description: 'Supplies', status: 'unpaid', paidAmount: 0, items: [{ name: 'Paper', qty: 10, price: 25 }] },
      { id: 2, billNo: 'BILL-002', supplierId: 1, date: '2026-01-04', description: 'Paid bill', status: 'paid', paidAmount: 100, items: [{ name: 'Ink', qty: 1, price: 100 }] },
    ],
    getTotal: vi.fn((items) => items.reduce((s, i) => s + (i.qty * i.price), 0)),
    getSupplier: vi.fn(() => ({ name: 'Test Supplier' })),
    ...overrides,
  }));
};

describe('PurchasesPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
    setupMock();
  });

  it('renders "Purchases" heading', () => {
    render(<PurchasesPage />);
    expect(screen.getByText('Purchases')).toBeInTheDocument();
  });

  it('renders New button that calls setShowModal with "purchase"', () => {
    const mockContext = createMockContext({
      purchases: [
        { id: 1, billNo: 'BILL-001', supplierId: 1, date: '2026-01-03', description: 'Supplies', status: 'unpaid', paidAmount: 0, items: [{ name: 'Paper', qty: 10, price: 25 }] },
      ],
      getTotal: vi.fn((items) => items.reduce((s, i) => s + (i.qty * i.price), 0)),
      getSupplier: vi.fn(() => ({ name: 'Test Supplier' })),
    });
    useApp.mockReturnValue(mockContext);
    render(<PurchasesPage />);
    fireEvent.click(screen.getByText('New'));
    expect(mockContext.setShowModal).toHaveBeenCalledWith('purchase');
  });

  it('renders purchase rows with bill numbers', () => {
    render(<PurchasesPage />);
    expect(screen.getByText('BILL-001')).toBeInTheDocument();
    expect(screen.getByText('BILL-002')).toBeInTheDocument();
  });

  it('shows pay button for unpaid purchases', () => {
    render(<PurchasesPage />);
    // The unpaid purchase (BILL-001) should have a pay button (CreditCard icon)
    const statusBadges = screen.getAllByTestId('status-badge');
    expect(statusBadges).toHaveLength(2);
    expect(screen.getByText('unpaid')).toBeInTheDocument();
  });

  it('does NOT show pay button for paid purchases', () => {
    // Render with only a paid purchase
    useApp.mockReturnValue(createMockContext({
      purchases: [
        { id: 2, billNo: 'BILL-002', supplierId: 1, date: '2026-01-04', description: 'Paid bill', status: 'paid', paidAmount: 100, items: [{ name: 'Ink', qty: 1, price: 100 }] },
      ],
      getTotal: vi.fn((items) => items.reduce((s, i) => s + (i.qty * i.price), 0)),
      getSupplier: vi.fn(() => ({ name: 'Test Supplier' })),
    }));
    render(<PurchasesPage />);
    // For the paid purchase, the last <td> should have no button
    const rows = screen.getAllByRole('row');
    // rows[0] is the header, rows[1] is the paid purchase
    const lastCellButtons = rows[1].querySelectorAll('td:last-child button');
    expect(lastCellButtons).toHaveLength(0);
  });
});
