import { render, screen, fireEvent } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import TransactionsPage from '@/app/transactions/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    transactions: [
      { id: 1, type: 'income', amount: 5000, category: 0, description: 'Salary', date: '2026-01-01' },
      { id: 2, type: 'expense', amount: 200, category: 0, description: 'Food', date: '2026-01-02' },
    ],
    ...overrides,
  }));
};

describe('TransactionsPage', () => {
  beforeEach(() => {
    setupMock();
  });

  it('renders "Transactions" heading', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('renders Add button', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('clicking Add calls setShowModal with "transaction"', () => {
    const mockContext = createMockContext({
      transactions: [
        { id: 1, type: 'income', amount: 5000, category: 0, description: 'Salary', date: '2026-01-01' },
      ],
    });
    useApp.mockReturnValue(mockContext);
    render(<TransactionsPage />);
    fireEvent.click(screen.getByText('Add'));
    expect(mockContext.setShowModal).toHaveBeenCalledWith('transaction');
  });

  it('renders transaction rows', () => {
    render(<TransactionsPage />);
    // "Salary" and "Food" appear as both description and category name, use getAllByText
    expect(screen.getAllByText('Salary').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Food').length).toBeGreaterThanOrEqual(1);
  });

  it('shows formatted amounts with +/- prefix', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('+₹5,000')).toBeInTheDocument();
    expect(screen.getByText('-₹200')).toBeInTheDocument();
  });

  it('delete button calls deleteTransaction', () => {
    const mockContext = createMockContext({
      transactions: [
        { id: 1, type: 'income', amount: 5000, category: 0, description: 'Salary', date: '2026-01-01' },
      ],
    });
    useApp.mockReturnValue(mockContext);
    render(<TransactionsPage />);
    // The delete button is the X icon button in each row
    const deleteButtons = screen.getAllByRole('button').filter(btn => !btn.textContent.includes('Add'));
    fireEvent.click(deleteButtons[0]);
    expect(mockContext.deleteTransaction).toHaveBeenCalledWith(1);
  });
});
