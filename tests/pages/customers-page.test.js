import { render, screen, fireEvent } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import CustomersPage from '@/app/customers/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

vi.mock('@/components/AccountView', () => ({
  default: () => <div data-testid="account-view">AccountView</div>,
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    customers: [{ id: 1, name: 'ABC Corp', email: 'contact@abccorp.com' }],
    totalReceivables: 900,
    getCustomerBalance: vi.fn(() => 900),
    newSale: { customerId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
    ...overrides,
  }));
};

describe('CustomersPage', () => {
  beforeEach(() => {
    setupMock();
  });

  it('renders "Customers" heading with receivables', () => {
    render(<CustomersPage />);
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText(/Receivables/)).toBeInTheDocument();
    // ₹900 appears in both heading and customer card, so use getAllByText
    const amountElements = screen.getAllByText(/₹900/);
    expect(amountElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders customer names', () => {
    render(<CustomersPage />);
    expect(screen.getByText('ABC Corp')).toBeInTheDocument();
  });

  it('Add button calls setShowModal with "customer"', () => {
    const mockContext = createMockContext({
      customers: [{ id: 1, name: 'ABC Corp', email: 'contact@abccorp.com' }],
      totalReceivables: 900,
      getCustomerBalance: vi.fn(() => 900),
      newSale: { customerId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
    });
    useApp.mockReturnValue(mockContext);
    render(<CustomersPage />);
    fireEvent.click(screen.getByText('Add'));
    expect(mockContext.setShowModal).toHaveBeenCalledWith('customer');
  });

  it('Receive button calls setPaymentModal with correct args', () => {
    const mockContext = createMockContext({
      customers: [{ id: 1, name: 'ABC Corp', email: 'contact@abccorp.com' }],
      totalReceivables: 900,
      getCustomerBalance: vi.fn(() => 900),
      newSale: { customerId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
    });
    useApp.mockReturnValue(mockContext);
    render(<CustomersPage />);
    fireEvent.click(screen.getByText('Receive'));
    expect(mockContext.setPaymentModal).toHaveBeenCalledWith({
      type: 'customer',
      id: 1,
      name: 'ABC Corp',
    });
  });

  it('Sale button calls setShowModal with "sale"', () => {
    const mockContext = createMockContext({
      customers: [{ id: 1, name: 'ABC Corp', email: 'contact@abccorp.com' }],
      totalReceivables: 900,
      getCustomerBalance: vi.fn(() => 900),
      newSale: { customerId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
    });
    useApp.mockReturnValue(mockContext);
    render(<CustomersPage />);
    fireEvent.click(screen.getByText(/Sale/));
    expect(mockContext.setShowModal).toHaveBeenCalledWith('sale');
  });
});
