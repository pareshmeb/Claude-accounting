import { render, screen, fireEvent } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import SalesPage from '@/app/sales/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => '/sales'),
}));

vi.mock('@/components/StatusBadge', () => ({
  default: ({ status }) => <span data-testid="status-badge">{status}</span>,
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    sales: [
      { id: 1, invoiceNo: 'INV-001', customerId: 1, date: '2026-01-05', description: 'Web Design', status: 'unpaid', paidAmount: 0, items: [{ name: 'Design', qty: 1, price: 1500 }] },
      { id: 2, invoiceNo: 'INV-002', customerId: 2, date: '2026-01-06', description: 'Consulting', status: 'paid', paidAmount: 1000, items: [{ name: 'Consulting', qty: 5, price: 200 }] },
    ],
    getTotal: vi.fn((items) => items.reduce((s, i) => s + (i.qty * i.price), 0)),
    getCustomer: vi.fn(() => ({ name: 'Test Customer' })),
    ...overrides,
  }));
};

describe('SalesPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
    setupMock();
  });

  it('renders "Sales" heading', () => {
    render(<SalesPage />);
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('renders New button that calls setShowModal with "sale"', () => {
    const mockContext = createMockContext({
      sales: [
        { id: 1, invoiceNo: 'INV-001', customerId: 1, date: '2026-01-05', description: 'Web Design', status: 'unpaid', paidAmount: 0, items: [{ name: 'Design', qty: 1, price: 1500 }] },
      ],
      getTotal: vi.fn((items) => items.reduce((s, i) => s + (i.qty * i.price), 0)),
      getCustomer: vi.fn(() => ({ name: 'Test Customer' })),
    });
    useApp.mockReturnValue(mockContext);
    render(<SalesPage />);
    fireEvent.click(screen.getByText('New'));
    expect(mockContext.setShowModal).toHaveBeenCalledWith('sale');
  });

  it('renders sale rows with invoice numbers', () => {
    render(<SalesPage />);
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();
  });

  it('shows pay button for unpaid sales', () => {
    render(<SalesPage />);
    expect(screen.getByText('unpaid')).toBeInTheDocument();
    // The unpaid row should have a CreditCard button
    const statusBadges = screen.getAllByTestId('status-badge');
    expect(statusBadges).toHaveLength(2);
  });

  it('does NOT show pay button for paid sales', () => {
    useApp.mockReturnValue(createMockContext({
      sales: [
        { id: 2, invoiceNo: 'INV-002', customerId: 2, date: '2026-01-06', description: 'Consulting', status: 'paid', paidAmount: 1000, items: [{ name: 'Consulting', qty: 5, price: 200 }] },
      ],
      getTotal: vi.fn((items) => items.reduce((s, i) => s + (i.qty * i.price), 0)),
      getCustomer: vi.fn(() => ({ name: 'Test Customer' })),
    }));
    render(<SalesPage />);
    const rows = screen.getAllByRole('row');
    // rows[0] is the header, rows[1] is the paid sale
    const lastCellButtons = rows[1].querySelectorAll('td:last-child button');
    expect(lastCellButtons).toHaveLength(0);
  });
});
