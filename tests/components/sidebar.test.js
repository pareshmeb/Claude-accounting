import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
}));

describe('Sidebar', () => {
  let mockSetLang;

  beforeEach(() => {
    mockSetLang = vi.fn();
    useApp.mockReturnValue(createMockContext({ setLang: mockSetLang }));
  });

  it('renders app name AccuBooks', () => {
    render(<Sidebar />);
    expect(screen.getByText('AccuBooks')).toBeInTheDocument();
  });

  it('renders all 9 navigation items', () => {
    render(<Sidebar />);
    const navLabels = [
      'Dashboard', 'Transactions', 'Suppliers', 'Customers',
      'Purchases', 'Sales', 'Creditors', 'Debtors', 'Reports',
    ];
    navLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('shows language toggle button with Gujarati when lang is en', () => {
    render(<Sidebar />);
    expect(screen.getByText('ગુજરાતી')).toBeInTheDocument();
  });

  it('active route (/) gets indigo styling', () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-indigo-600');
  });

  it('clicking language toggle calls setLang', () => {
    render(<Sidebar />);
    const toggleButton = screen.getByText('ગુજરાતી').closest('button');
    fireEvent.click(toggleButton);
    expect(mockSetLang).toHaveBeenCalledWith('gu');
  });
});
