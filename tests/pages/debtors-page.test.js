import { render, screen, fireEvent } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import DebtorsPage from '@/app/debtors/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    debtors: [{ id: 1, name: 'John Smith', amount: 500, received: 100, dueDate: '2026-02-01', description: 'Personal loan' }],
    debtorReceipts: [{ id: 1, debtorId: 1, amount: 100, date: '2026-01-08', description: 'First repayment' }],
    totalDebtorOwed: 400,
    ...overrides,
  }));
};

describe('DebtorsPage', () => {
  beforeEach(() => {
    setupMock();
  });

  it('renders "Debtors" heading with owed amount', () => {
    render(<DebtorsPage />);
    expect(screen.getByText('Debtors')).toBeInTheDocument();
    expect(screen.getByText(/Owed/)).toBeInTheDocument();
    // ₹400 appears in both heading and debtor card, so use getAllByText
    const amountElements = screen.getAllByText(/₹400/);
    expect(amountElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders debtor names', () => {
    render(<DebtorsPage />);
    expect(screen.getByText('John Smith')).toBeInTheDocument();
  });

  it('Receive button calls setPaymentModal with correct args', () => {
    const mockContext = createMockContext({
      debtors: [{ id: 1, name: 'John Smith', amount: 500, received: 100, dueDate: '2026-02-01', description: 'Personal loan' }],
      debtorReceipts: [],
      totalDebtorOwed: 400,
    });
    useApp.mockReturnValue(mockContext);
    render(<DebtorsPage />);
    fireEvent.click(screen.getByText('Receive'));
    expect(mockContext.setPaymentModal).toHaveBeenCalledWith({
      type: 'debtor',
      id: 1,
      name: 'John Smith',
      max: 400,
    });
  });

  it('Delete button calls deleteDebtor', () => {
    const mockContext = createMockContext({
      debtors: [{ id: 1, name: 'John Smith', amount: 500, received: 100, dueDate: '2026-02-01', description: 'Personal loan' }],
      debtorReceipts: [],
      totalDebtorOwed: 400,
    });
    useApp.mockReturnValue(mockContext);
    render(<DebtorsPage />);
    const allButtons = screen.getAllByRole('button');
    const deleteButton = allButtons.find(btn => !btn.textContent.includes('Add') && !btn.textContent.includes('Receive'));
    fireEvent.click(deleteButton);
    expect(mockContext.deleteDebtor).toHaveBeenCalledWith(1);
  });

  it('shows receipt history when receipts exist', () => {
    render(<DebtorsPage />);
    expect(screen.getByText('Receipt History:')).toBeInTheDocument();
    expect(screen.getByText('First repayment')).toBeInTheDocument();
    expect(screen.getByText('2026-01-08')).toBeInTheDocument();
  });
});
