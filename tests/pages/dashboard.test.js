import { render, screen, fireEvent } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import DashboardPage from '@/app/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  usePathname: vi.fn(() => '/'),
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    suppliers: [{ id: 1, name: 'Supplier A' }, { id: 2, name: 'Supplier B' }],
    customers: [{ id: 1, name: 'Customer A' }],
    balance: 5000,
    totalIncome: 10000,
    totalExpense: 5000,
    totalSalesAmt: 2500,
    totalPurchasesAmt: 1500,
    totalPayables: 700,
    totalReceivables: 900,
    totalCreditorOwed: 8000,
    totalDebtorOwed: 400,
    getSupplierBalance: vi.fn(() => 350),
    getCustomerBalance: vi.fn(() => 900),
    ...overrides,
  }));
};

describe('DashboardPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
    setupMock();
  });

  it('renders "Dashboard" heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders stat cards with balance, income, and expenses labels', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('renders stat cards for sales, purchases, payables, receivables, and net', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Purchases')).toBeInTheDocument();
    expect(screen.getByText('Payables')).toBeInTheDocument();
    expect(screen.getByText('Receivables')).toBeInTheDocument();
    expect(screen.getByText('Net')).toBeInTheDocument();
  });

  it('renders "Top Suppliers" heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Top Suppliers')).toBeInTheDocument();
  });

  it('renders "Top Customers" heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Top Customers')).toBeInTheDocument();
  });

  it('shows supplier names when suppliers provided', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Supplier A')).toBeInTheDocument();
    expect(screen.getByText('Supplier B')).toBeInTheDocument();
  });

  it('shows customer names when customers provided', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Customer A')).toBeInTheDocument();
  });
});
