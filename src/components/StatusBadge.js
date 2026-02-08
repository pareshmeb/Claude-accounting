'use client';
import { useApp } from '@/context/AppContext';

export default function StatusBadge({ status }) {
  const { lang } = useApp();
  const styles = {
    paid: 'bg-emerald-500/20 text-emerald-400',
    partial: 'bg-yellow-500/20 text-yellow-400',
    unpaid: 'bg-red-500/20 text-red-400',
  };
  const labels = {
    paid: lang === 'gu' ? 'ચૂકવેલ' : 'paid',
    partial: lang === 'gu' ? 'આંશિક' : 'partial',
    unpaid: lang === 'gu' ? 'બાકી' : 'unpaid',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
