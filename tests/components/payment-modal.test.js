import { render, screen, fireEvent } from '@testing-library/react';
import PaymentModal from '@/components/PaymentModal';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('PaymentModal', () => {
  let mockSetPaymentModal, mockSetPaymentAmount, mockSetPaymentDesc, mockSetPaymentDate, mockMakePaymentAction;

  beforeEach(() => {
    mockSetPaymentModal = vi.fn();
    mockSetPaymentAmount = vi.fn();
    mockSetPaymentDesc = vi.fn();
    mockSetPaymentDate = vi.fn();
    mockMakePaymentAction = vi.fn();
  });

  function renderWithPaymentModal(type, overrides = {}) {
    const mockCtx = createMockContext({
      paymentModal: { type, id: 1, name: 'Test Entity' },
      paymentAmount: '500',
      paymentDesc: 'Test payment',
      paymentDate: '2026-02-01',
      setPaymentModal: mockSetPaymentModal,
      setPaymentAmount: mockSetPaymentAmount,
      setPaymentDesc: mockSetPaymentDesc,
      setPaymentDate: mockSetPaymentDate,
      makePaymentAction: mockMakePaymentAction,
      ...overrides,
    });
    useApp.mockReturnValue(mockCtx);
    return render(<PaymentModal />);
  }

  it('returns null when paymentModal is null', () => {
    useApp.mockReturnValue(createMockContext({ paymentModal: null }));
    const { container } = render(<PaymentModal />);
    expect(container.innerHTML).toBe('');
  });

  it('renders Make Payment title for supplier type', () => {
    renderWithPaymentModal('supplier');
    expect(screen.getByText('Make Payment')).toBeInTheDocument();
    expect(screen.getByText(/To:/)).toBeInTheDocument();
    expect(screen.getByText('Test Entity')).toBeInTheDocument();
  });

  it('renders Make Payment title for creditor type', () => {
    renderWithPaymentModal('creditor');
    expect(screen.getByText('Make Payment')).toBeInTheDocument();
    expect(screen.getByText(/To:/)).toBeInTheDocument();
  });

  it('renders Receive Payment title for customer type', () => {
    renderWithPaymentModal('customer');
    expect(screen.getByText('Receive Payment')).toBeInTheDocument();
    expect(screen.getByText(/From:/)).toBeInTheDocument();
  });

  it('renders Receive Payment title for debtor type', () => {
    renderWithPaymentModal('debtor');
    expect(screen.getByText('Receive Payment')).toBeInTheDocument();
    expect(screen.getByText(/From:/)).toBeInTheDocument();
  });

  it('shows outstanding amount when max is provided', () => {
    renderWithPaymentModal('supplier', {
      paymentModal: { type: 'supplier', id: 1, name: 'Test Entity', max: 5000 },
    });
    expect(screen.getByText(/Outstanding/)).toBeInTheDocument();
    expect(screen.getByText(/₹5,000/)).toBeInTheDocument();
  });

  it('does not show outstanding when max is not provided', () => {
    renderWithPaymentModal('supplier');
    expect(screen.queryByText(/Outstanding/)).not.toBeInTheDocument();
  });

  it('renders date, amount, and description inputs', () => {
    renderWithPaymentModal('supplier');
    expect(screen.getByDisplayValue('2026-02-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test payment')).toBeInTheDocument();
  });

  it('date input calls setPaymentDate on change', () => {
    renderWithPaymentModal('supplier');
    fireEvent.change(screen.getByDisplayValue('2026-02-01'), { target: { value: '2026-03-15' } });
    expect(mockSetPaymentDate).toHaveBeenCalledWith('2026-03-15');
  });

  it('amount input calls setPaymentAmount on change', () => {
    renderWithPaymentModal('supplier');
    fireEvent.change(screen.getByDisplayValue('500'), { target: { value: '1000' } });
    expect(mockSetPaymentAmount).toHaveBeenCalledWith('1000');
  });

  it('description input calls setPaymentDesc on change', () => {
    renderWithPaymentModal('supplier');
    fireEvent.change(screen.getByDisplayValue('Test payment'), { target: { value: 'Updated desc' } });
    expect(mockSetPaymentDesc).toHaveBeenCalledWith('Updated desc');
  });

  it('confirm button calls makePaymentAction', () => {
    renderWithPaymentModal('supplier');
    fireEvent.click(screen.getByText('Confirm'));
    expect(mockMakePaymentAction).toHaveBeenCalledTimes(1);
  });

  it('close button calls setPaymentModal(null)', () => {
    renderWithPaymentModal('supplier');
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(btn => !btn.textContent.includes('Confirm'));
    fireEvent.click(closeButton);
    expect(mockSetPaymentModal).toHaveBeenCalledWith(null);
  });

  it('clicking overlay calls setPaymentModal(null)', () => {
    const { container } = renderWithPaymentModal('supplier');
    const overlay = container.firstChild;
    fireEvent.click(overlay);
    expect(mockSetPaymentModal).toHaveBeenCalledWith(null);
  });

  it('clicking modal content does not close modal', () => {
    renderWithPaymentModal('supplier');
    const amountInput = screen.getByDisplayValue('500');
    fireEvent.click(amountInput);
    expect(mockSetPaymentModal).not.toHaveBeenCalled();
  });
});
