import { render, screen, fireEvent } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import SuppliersPage from '@/app/suppliers/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

vi.mock('@/components/AccountView', () => ({
  default: () => <div data-testid="account-view">AccountView</div>,
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    suppliers: [{ id: 1, name: 'Office Supplies Co', email: 'info@test.com' }],
    totalPayables: 700,
    getSupplierBalance: vi.fn(() => 700),
    newPurchase: { supplierId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
    ...overrides,
  }));
};

describe('SuppliersPage', () => {
  beforeEach(() => {
    setupMock();
  });

  it('renders "Suppliers" heading with payables', () => {
    render(<SuppliersPage />);
    expect(screen.getByText('Suppliers')).toBeInTheDocument();
    expect(screen.getByText(/Payables/)).toBeInTheDocument();
    // ₹700 appears in both heading and supplier card, so use getAllByText
    const amountElements = screen.getAllByText(/₹700/);
    expect(amountElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders supplier names', () => {
    render(<SuppliersPage />);
    expect(screen.getByText('Office Supplies Co')).toBeInTheDocument();
  });

  it('Add button calls setShowModal with "supplier"', () => {
    const mockContext = createMockContext({
      suppliers: [{ id: 1, name: 'Office Supplies Co', email: 'info@test.com' }],
      totalPayables: 700,
      getSupplierBalance: vi.fn(() => 700),
      newPurchase: { supplierId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
    });
    useApp.mockReturnValue(mockContext);
    render(<SuppliersPage />);
    fireEvent.click(screen.getByText('Add'));
    expect(mockContext.setShowModal).toHaveBeenCalledWith('supplier');
  });

  it('Pay button calls setPaymentModal with correct args', () => {
    const mockContext = createMockContext({
      suppliers: [{ id: 1, name: 'Office Supplies Co', email: 'info@test.com' }],
      totalPayables: 700,
      getSupplierBalance: vi.fn(() => 700),
      newPurchase: { supplierId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
    });
    useApp.mockReturnValue(mockContext);
    render(<SuppliersPage />);
    fireEvent.click(screen.getByText('Pay'));
    expect(mockContext.setPaymentModal).toHaveBeenCalledWith({
      type: 'supplier',
      id: 1,
      name: 'Office Supplies Co',
    });
  });

  it('Purchase button calls setShowModal with "purchase"', () => {
    const mockContext = createMockContext({
      suppliers: [{ id: 1, name: 'Office Supplies Co', email: 'info@test.com' }],
      totalPayables: 700,
      getSupplierBalance: vi.fn(() => 700),
      newPurchase: { supplierId: '', date: '2026-01-01', description: '', items: [{ name: '', qty: 1, price: '' }] },
    });
    useApp.mockReturnValue(mockContext);
    render(<SuppliersPage />);
    fireEvent.click(screen.getByText(/Purchase/));
    expect(mockContext.setShowModal).toHaveBeenCalledWith('purchase');
  });
});
