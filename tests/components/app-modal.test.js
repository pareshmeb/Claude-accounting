import { render, screen, fireEvent } from '@testing-library/react';
import AppModal from '@/components/AppModal';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('AppModal', () => {
  let mockSetShowModal;
  let mockSetNewSupplier, mockSetNewCustomer;
  let mockSetNewPurchase, mockSetNewSale;
  let mockUpdateItem, mockRemoveItem, mockAddItem;

  beforeEach(() => {
    mockSetShowModal = vi.fn();
    mockSetNewSupplier = vi.fn();
    mockSetNewCustomer = vi.fn();
    mockSetNewPurchase = vi.fn();
    mockSetNewSale = vi.fn();
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
