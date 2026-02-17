'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/formatDate';
import { Plus, X, Calendar } from 'lucide-react';

export default function TransactionsPage() {
  const {
    t, transactions, setShowModal,
    getCategoryName, deleteTransaction,
  } = useApp();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (fromDate && tx.date < fromDate) return false;
      if (toDate && tx.date > toDate) return false;
      return true;
    });
  }, [transactions, fromDate, toDate]);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
  };

  const hasFilters = fromDate || toDate;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{t.transactions}</h2>
        <button onClick={() => setShowModal('transaction')} className="flex items-center gap-1 px-2 py-1 bg-indigo-600 rounded text-xs">
          <Plus size={12} /> {t.add}
        </button>
      </div>

      {/* Date Filter Box */}
      <div className="bg-gray-800 rounded-xl p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={14} />
            <span className="text-xs font-medium">{t.filterByDate}</span>
          </div>
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500">{t.from}</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500">{t.to}</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={12} /> {t.clear}
              </button>
            )}
          </div>
          {hasFilters && (
            <span className="text-xs text-gray-500 ml-auto">
              {filteredTransactions.length} {t.of} {transactions.length}
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left p-2">{t.date}</th>
              <th className="text-left p-2">{t.description}</th>
              <th className="text-left p-2">{t.category}</th>
              <th className="text-left p-2">{t.type}</th>
              <th className="text-right p-2">{t.amount}</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.slice().reverse().map(tx => (
              <tr key={tx.id} className="border-t border-gray-700">
                <td className="p-2 text-gray-400">{formatDate(tx.date)}</td>
                <td className="p-2 max-w-40 truncate" title={tx.description}>{tx.description || '-'}</td>
                <td className="p-2"><span className="px-1 py-0.5 bg-gray-700 rounded">{getCategoryName(tx.type, tx.category)}</span></td>
                <td className="p-2">
                  <span className={`px-1 py-0.5 rounded ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.type === 'income' ? t.income : t.expense}
                  </span>
                </td>
                <td className={`p-2 text-right font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </td>
                <td className="p-2">
                  <button onClick={() => window.confirm(t.confirmDelete.replace('{name}', tx.description || tx.date)) && deleteTransaction(tx.id)} className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400">
                    <X size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
