import { render, screen } from '@testing-library/react';
import StatCard from '@/components/StatCard';

const MockIcon = (props) => <span data-testid="icon" {...props} />;

describe('StatCard', () => {
  it('renders label text', () => {
    render(<StatCard icon={MockIcon} label="Income" value={5000} color="text-emerald-400" />);
    expect(screen.getByText('Income')).toBeInTheDocument();
  });

  it('renders formatted value with rupee symbol', () => {
    render(<StatCard icon={MockIcon} label="Income" value={5000} color="text-emerald-400" />);
    expect(screen.getByText(/₹5,000/)).toBeInTheDocument();
  });

  it('applies color class', () => {
    render(<StatCard icon={MockIcon} label="Income" value={5000} color="text-emerald-400" />);
    const valueEl = screen.getByText(/₹5,000/);
    expect(valueEl).toHaveClass('text-emerald-400');
  });
});
