import { render, screen } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import ReportsPage from '@/app/reports/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    totalIncome: 10000,
    totalExpense: 5000,
    balance: 5000,
    totalSalesAmt: 2500,
    totalPurchasesAmt: 1500,
    totalPayables: 700,
    totalReceivables: 900,
    totalCreditorOwed: 0,
    totalDebtorOwed: 0,
    ...overrides,
  }));
};

describe('ReportsPage', () => {
  beforeEach(() => {
    setupMock();
  });

  it('renders "Reports" heading', () => {
    render(<ReportsPage />);
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders "Financial Summary" section', () => {
    render(<ReportsPage />);
    expect(screen.getByText('Financial Summary')).toBeInTheDocument();
  });

  it('shows income, expenses, and balance amounts', () => {
    render(<ReportsPage />);
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
    // ₹5,000 appears for both expenses and balance, so use getAllByText
    const fiveThousandElements = screen.getAllByText('₹5,000');
    expect(fiveThousandElements.length).toBe(2);
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
  });

  it('renders chart container', () => {
    render(<ReportsPage />);
    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });
});
