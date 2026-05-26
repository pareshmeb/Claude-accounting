import { render, screen, fireEvent } from '@testing-library/react';
import AppModal from '@/components/AppModal';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('AppModal', () => {
  let mockSetShowModal;
  let mockSetNewSupplier, mockSetNewCustomer, mockSetNewCreditor, mockSetNewDebtor;
  let mockSetNewPurchase, mockSetNewSale, mockSetNewTx;
  let mockUpdateItem, mockRemoveItem, mockAddItem;

  beforeEach(() => {
    mockSetShowModal = vi.fn();
    mockSetNewSupplier = vi.fn();
    mockSetNewCustomer = vi.fn();
    mockSetNewCreditor = vi.fn();
    mockSetNewDebtor = vi.fn();
    mockSetNewPurchase = vi.fn();
    mockSetNewSale = vi.fn();
    mockSetNewTx = vi.fn();
    mockUpdateItem = vi.fn();
    mockRemoveItem = vi.fn();
    mockAddItem = vi.fn();
  });

  it('returns null when showModal is null', () => {
    useApp.mockReturnValue(createMockContext({ showModal: null }));
    const { container } = render(<AppModal />);
    expect(container.innerHTML).toBe('');
  });

  // --- Supplier ---
  it('renders supplier form', () => {
    useApp.mockReturnValue(createMockContext({ showModal: 'supplier' }));
    render(<AppModal />);
    expect(screen.getByRole('heading', { name: 'Add Supplier' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Address')).toBeInTheDocument();
  });

  it('supplier form inputs call setNewSupplier on change', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'supplier',
      setNewSupplier: mockSetNewSupplier,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Name *'), { target: { value: 'Test' } });
    expect(mockSetNewSupplier).toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@test.com' } });
    expect(mockSetNewSupplier).toHaveBeenCalledTimes(2);
    fireEvent.change(screen.getByPlaceholderText('Phone'), { target: { value: '123' } });
    expect(mockSetNewSupplier).toHaveBeenCalledTimes(3);
    fireEvent.change(screen.getByPlaceholderText('Address'), { target: { value: 'Addr' } });
    expect(mockSetNewSupplier).toHaveBeenCalledTimes(4);
  });

  it('submit button for supplier calls addSupplierAction', () => {
    const mockAdd = vi.fn();
    useApp.mockReturnValue(createMockContext({ showModal: 'supplier', addSupplierAction: mockAdd }));
    render(<AppModal />);
    const submitButton = screen.getAllByRole('button').find(btn => btn.textContent === 'Add Supplier');
    fireEvent.click(submitButton);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  // --- Customer ---
  it('renders customer form', () => {
    useApp.mockReturnValue(createMockContext({ showModal: 'customer' }));
    render(<AppModal />);
    expect(screen.getByRole('heading', { name: 'Add Customer' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name *')).toBeInTheDocument();
  });

  it('customer form inputs call setNewCustomer on change', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'customer',
      setNewCustomer: mockSetNewCustomer,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Name *'), { target: { value: 'Cust' } });
    expect(mockSetNewCustomer).toHaveBeenCalled();
  });

  it('submit button for customer calls addCustomerAction', () => {
    const mockAdd = vi.fn();
    useApp.mockReturnValue(createMockContext({ showModal: 'customer', addCustomerAction: mockAdd }));
    render(<AppModal />);
    const submitButton = screen.getAllByRole('button').find(btn => btn.textContent === 'Add Customer');
    fireEvent.click(submitButton);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  // --- Creditor ---
  it('renders creditor form with amount and date fields', () => {
    useApp.mockReturnValue(createMockContext({ showModal: 'creditor' }));
    render(<AppModal />);
    expect(screen.getByRole('heading', { name: 'Add Creditor' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount owed *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description (e.g., loan purpose, terms)')).toBeInTheDocument();
  });

  it('creditor form inputs call setNewCreditor on change', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'creditor',
      setNewCreditor: mockSetNewCreditor,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Name *'), { target: { value: 'Cred' } });
    expect(mockSetNewCreditor).toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText('Amount owed *'), { target: { value: '500' } });
    expect(mockSetNewCreditor).toHaveBeenCalledTimes(2);
    fireEvent.change(screen.getByPlaceholderText('Description (e.g., loan purpose, terms)'), { target: { value: 'Loan' } });
    expect(mockSetNewCreditor).toHaveBeenCalledTimes(3);
  });

  it('submit button for creditor calls addCreditorAction', () => {
    const mockAdd = vi.fn();
    useApp.mockReturnValue(createMockContext({ showModal: 'creditor', addCreditorAction: mockAdd }));
    render(<AppModal />);
    const submitButton = screen.getAllByRole('button').find(btn => btn.textContent === 'Add Creditor');
    fireEvent.click(submitButton);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  // --- Debtor ---
  it('renders debtor form with amount and date fields', () => {
    useApp.mockReturnValue(createMockContext({ showModal: 'debtor' }));
    render(<AppModal />);
    expect(screen.getByRole('heading', { name: 'Add Debtor' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount owed to you *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description (e.g., reason for loan, terms)')).toBeInTheDocument();
  });

  it('debtor form inputs call setNewDebtor on change', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'debtor',
      setNewDebtor: mockSetNewDebtor,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Name *'), { target: { value: 'Debt' } });
    expect(mockSetNewDebtor).toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText('Amount owed to you *'), { target: { value: '300' } });
    expect(mockSetNewDebtor).toHaveBeenCalledTimes(2);
    fireEvent.change(screen.getByPlaceholderText('Description (e.g., reason for loan, terms)'), { target: { value: 'Lent' } });
    expect(mockSetNewDebtor).toHaveBeenCalledTimes(3);
  });

  it('submit button for debtor calls addDebtorAction', () => {
    const mockAdd = vi.fn();
    useApp.mockReturnValue(createMockContext({ showModal: 'debtor', addDebtorAction: mockAdd }));
    render(<AppModal />);
    const submitButton = screen.getAllByRole('button').find(btn => btn.textContent === 'Add Debtor');
    fireEvent.click(submitButton);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  // --- Purchase ---
  it('renders purchase form with supplier select and items', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'purchase',
      suppliers: [{ id: 1, name: 'Supplier A' }],
    }));
    render(<AppModal />);
    expect(screen.getByRole('heading', { name: 'New Purchase' })).toBeInTheDocument();
    expect(screen.getByText('Supplier A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Item *')).toBeInTheDocument();
    expect(screen.getByText('+ Add Item')).toBeInTheDocument();
  });

  it('purchase form calls setNewPurchase on input change', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'purchase',
      suppliers: [{ id: 1, name: 'Supplier A' }],
      setNewPurchase: mockSetNewPurchase,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Description (e.g., purchase purpose, notes)'), { target: { value: 'Bulk order' } });
    expect(mockSetNewPurchase).toHaveBeenCalled();
  });

  it('purchase item inputs call updateItem', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'purchase',
      suppliers: [{ id: 1, name: 'Supplier A' }],
      updateItem: mockUpdateItem,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Item *'), { target: { value: 'Pen' } });
    expect(mockUpdateItem).toHaveBeenCalledWith('purchase', 0, 'name', 'Pen');
  });

  it('purchase add item button calls addItem', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'purchase',
      suppliers: [{ id: 1, name: 'Supplier A' }],
      addItem: mockAddItem,
    }));
    render(<AppModal />);
    fireEvent.click(screen.getByText('+ Add Item'));
    expect(mockAddItem).toHaveBeenCalledWith('purchase');
  });

  it('purchase remove button shown when multiple items', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'purchase',
      suppliers: [{ id: 1, name: 'Supplier A' }],
      newPurchase: {
        supplierId: '1',
        date: '2026-01-01',
        description: '',
        items: [{ name: 'A', qty: 1, price: '10' }, { name: 'B', qty: 1, price: '20' }],
      },
      removeItem: mockRemoveItem,
    }));
    render(<AppModal />);
    // Should have remove buttons (X icons in item rows)
    const removeButtons = screen.getAllByRole('button').filter(btn => {
      return btn.classList.contains('text-red-400');
    });
    expect(removeButtons.length).toBe(2);
    fireEvent.click(removeButtons[0]);
    expect(mockRemoveItem).toHaveBeenCalledWith('purchase', 0);
  });

  it('submit button for purchase calls addPurchaseAction', () => {
    const mockAdd = vi.fn();
    useApp.mockReturnValue(createMockContext({
      showModal: 'purchase',
      suppliers: [{ id: 1, name: 'Supplier A' }],
      addPurchaseAction: mockAdd,
    }));
    render(<AppModal />);
    const submitButton = screen.getAllByRole('button').find(btn => btn.textContent === 'New Purchase');
    fireEvent.click(submitButton);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  // --- Sale ---
  it('renders sale form with customer select and items', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'sale',
      customers: [{ id: 1, name: 'Customer A' }],
    }));
    render(<AppModal />);
    expect(screen.getByRole('heading', { name: 'New Sale' })).toBeInTheDocument();
    expect(screen.getByText('Customer A')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Item *')).toBeInTheDocument();
    expect(screen.getByText('+ Add Item')).toBeInTheDocument();
  });

  it('sale form calls setNewSale on input change', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'sale',
      customers: [{ id: 1, name: 'Customer A' }],
      setNewSale: mockSetNewSale,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Description (e.g., project name, service details)'), { target: { value: 'Service order' } });
    expect(mockSetNewSale).toHaveBeenCalled();
  });

  it('sale item inputs call updateItem', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'sale',
      customers: [{ id: 1, name: 'Customer A' }],
      updateItem: mockUpdateItem,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Item *'), { target: { value: 'Widget' } });
    expect(mockUpdateItem).toHaveBeenCalledWith('sale', 0, 'name', 'Widget');
  });

  it('sale add item button calls addItem', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'sale',
      customers: [{ id: 1, name: 'Customer A' }],
      addItem: mockAddItem,
    }));
    render(<AppModal />);
    fireEvent.click(screen.getByText('+ Add Item'));
    expect(mockAddItem).toHaveBeenCalledWith('sale');
  });

  it('sale remove button shown when multiple items', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'sale',
      customers: [{ id: 1, name: 'Customer A' }],
      newSale: {
        customerId: '1',
        date: '2026-01-01',
        description: '',
        items: [{ name: 'X', qty: 1, price: '10' }, { name: 'Y', qty: 1, price: '20' }],
      },
      removeItem: mockRemoveItem,
    }));
    render(<AppModal />);
    const removeButtons = screen.getAllByRole('button').filter(btn => {
      return btn.classList.contains('text-red-400');
    });
    expect(removeButtons.length).toBe(2);
    fireEvent.click(removeButtons[1]);
    expect(mockRemoveItem).toHaveBeenCalledWith('sale', 1);
  });

  it('submit button for sale calls addSaleAction', () => {
    const mockAdd = vi.fn();
    useApp.mockReturnValue(createMockContext({
      showModal: 'sale',
      customers: [{ id: 1, name: 'Customer A' }],
      addSaleAction: mockAdd,
    }));
    render(<AppModal />);
    const submitButton = screen.getAllByRole('button').find(btn => btn.textContent === 'New Sale');
    fireEvent.click(submitButton);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  // --- Transaction ---
  it('renders transaction form with expense/income toggle', () => {
    useApp.mockReturnValue(createMockContext({ showModal: 'transaction' }));
    render(<AppModal />);
    expect(screen.getByRole('heading', { name: 'Add Transaction' })).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount *')).toBeInTheDocument();
  });

  it('transaction type buttons call setNewTx', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'transaction',
      setNewTx: mockSetNewTx,
    }));
    render(<AppModal />);
    fireEvent.click(screen.getByText('Income'));
    expect(mockSetNewTx).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Expense'));
    expect(mockSetNewTx).toHaveBeenCalledTimes(2);
  });

  it('transaction form inputs call setNewTx on change', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'transaction',
      setNewTx: mockSetNewTx,
    }));
    render(<AppModal />);
    fireEvent.change(screen.getByPlaceholderText('Amount *'), { target: { value: '500' } });
    expect(mockSetNewTx).toHaveBeenCalled();
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Groceries' } });
    expect(mockSetNewTx).toHaveBeenCalledTimes(2);
  });

  it('submit button for transaction calls addTransactionAction', () => {
    const mockAdd = vi.fn();
    useApp.mockReturnValue(createMockContext({ showModal: 'transaction', addTransactionAction: mockAdd }));
    render(<AppModal />);
    const submitButton = screen.getAllByRole('button').find(btn => btn.textContent === 'Add Transaction');
    fireEvent.click(submitButton);
    expect(mockAdd).toHaveBeenCalledTimes(1);
  });

  // --- Close / overlay ---
  it('close button calls setShowModal(null)', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'supplier',
      setShowModal: mockSetShowModal,
    }));
    render(<AppModal />);
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(btn => !btn.textContent.includes('Add Supplier'));
    fireEvent.click(closeButton);
    expect(mockSetShowModal).toHaveBeenCalledWith(null);
  });

  it('clicking overlay calls setShowModal(null)', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'supplier',
      setShowModal: mockSetShowModal,
    }));
    const { container } = render(<AppModal />);
    // The overlay is the outermost div with fixed positioning
    const overlay = container.firstChild;
    fireEvent.click(overlay);
    expect(mockSetShowModal).toHaveBeenCalledWith(null);
  });

  it('clicking modal content does not close modal (stopPropagation)', () => {
    useApp.mockReturnValue(createMockContext({
      showModal: 'supplier',
      setShowModal: mockSetShowModal,
    }));
    render(<AppModal />);
    // Click the form content area
    const nameInput = screen.getByPlaceholderText('Name *');
    fireEvent.click(nameInput);
    // setShowModal should NOT have been called (stopPropagation)
    expect(mockSetShowModal).not.toHaveBeenCalled();
  });
});
