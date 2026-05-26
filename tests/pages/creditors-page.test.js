import { render, screen, fireEvent } from '@testing-library/react';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';
import CreditorsPage from '@/app/creditors/page';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

const setupMock = (overrides = {}) => {
  useApp.mockReturnValue(createMockContext({
    creditors: [{ id: 1, name: 'Bank Loan', amount: 10000, paid: 2000, dueDate: '2026-12-01', description: 'Home loan' }],
    creditorPayments: [{ id: 1, creditorId: 1, amount: 2000, date: '2026-01-10', description: 'Installment' }],
    totalCreditorOwed: 8000,
    ...overrides,
  }));
};

describe('CreditorsPage', () => {
  beforeEach(() => {
    setupMock();
  });

  it('renders "Creditors" heading with owed amount', () => {
    render(<CreditorsPage />);
    expect(screen.getByText('Creditors')).toBeInTheDocument();
    expect(screen.getByText(/Owed/)).toBeInTheDocument();
    // ₹8,000 appears in both heading and card, so use getAllByText
    const owedElements = screen.getAllByText(/₹8,000/);
    expect(owedElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders creditor names', () => {
    render(<CreditorsPage />);
    expect(screen.getByText('Bank Loan')).toBeInTheDocument();
  });

  it('Add button calls setShowModal with "creditor"', () => {
    const mockContext = createMockContext({
      creditors: [{ id: 1, name: 'Bank Loan', amount: 10000, paid: 2000, dueDate: '2026-12-01', description: 'Home loan' }],
      creditorPayments: [],
      totalCreditorOwed: 8000,
    });
    useApp.mockReturnValue(mockContext);
    render(<CreditorsPage />);
    fireEvent.click(screen.getByText('Add'));
    expect(mockContext.setShowModal).toHaveBeenCalledWith('creditor');
  });

  it('Pay button calls setPaymentModal with correct args', () => {
    const mockContext = createMockContext({
      creditors: [{ id: 1, name: 'Bank Loan', amount: 10000, paid: 2000, dueDate: '2026-12-01', description: 'Home loan' }],
      creditorPayments: [],
      totalCreditorOwed: 8000,
    });
    useApp.mockReturnValue(mockContext);
    render(<CreditorsPage />);
    fireEvent.click(screen.getByText('Pay'));
    expect(mockContext.setPaymentModal).toHaveBeenCalledWith({
      type: 'creditor',
      id: 1,
      name: 'Bank Loan',
      max: 8000,
    });
  });

  it('Delete button calls deleteCreditor', () => {
    const mockContext = createMockContext({
      creditors: [{ id: 1, name: 'Bank Loan', amount: 10000, paid: 2000, dueDate: '2026-12-01', description: 'Home loan' }],
      creditorPayments: [],
      totalCreditorOwed: 8000,
    });
    useApp.mockReturnValue(mockContext);
    render(<CreditorsPage />);
    // The delete button is the X icon button next to Pay
    const allButtons = screen.getAllByRole('button');
    const deleteButton = allButtons.find(btn => !btn.textContent.includes('Add') && !btn.textContent.includes('Pay'));
    fireEvent.click(deleteButton);
    expect(mockContext.deleteCreditor).toHaveBeenCalledWith(1);
  });

  it('shows payment history when payments exist', () => {
    render(<CreditorsPage />);
    expect(screen.getByText('Payment History:')).toBeInTheDocument();
    expect(screen.getByText('Installment')).toBeInTheDocument();
    expect(screen.getByText('2026-01-10')).toBeInTheDocument();
  });
});
