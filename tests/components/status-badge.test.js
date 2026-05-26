import { render, screen } from '@testing-library/react';
import StatusBadge from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';
import { createMockContext } from '../helpers/render-with-context';

vi.mock('@/context/AppContext', () => ({
  useApp: vi.fn(),
}));

describe('StatusBadge', () => {
  beforeEach(() => {
    useApp.mockReturnValue(createMockContext());
  });

  it('renders paid with emerald styling in English', () => {
    render(<StatusBadge status="paid" />);
    const badge = screen.getByText('paid');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-emerald-500/20');
    expect(badge).toHaveClass('text-emerald-400');
  });

  it('renders partial with yellow styling', () => {
    render(<StatusBadge status="partial" />);
    const badge = screen.getByText('partial');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-yellow-500/20');
    expect(badge).toHaveClass('text-yellow-400');
  });

  it('renders unpaid with red styling', () => {
    render(<StatusBadge status="unpaid" />);
    const badge = screen.getByText('unpaid');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-500/20');
    expect(badge).toHaveClass('text-red-400');
  });

  it('renders Gujarati labels when lang is gu', () => {
    useApp.mockReturnValue(createMockContext({ lang: 'gu' }));

    const { rerender } = render(<StatusBadge status="paid" />);
    expect(screen.getByText('ચૂકવેલ')).toBeInTheDocument();

    rerender(<StatusBadge status="partial" />);
    expect(screen.getByText('આંશિક')).toBeInTheDocument();

    rerender(<StatusBadge status="unpaid" />);
    expect(screen.getByText('બાકી')).toBeInTheDocument();
  });
});
