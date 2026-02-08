'use client';
import { useApp } from '@/context/AppContext';
import { Plus, X } from 'lucide-react';

export default function TransactionsPage() {
  const {
    t, transactions, setShowModal,
    getCategoryName, deleteTransaction,
  } = useApp();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{t.transactions}</h2>
        <button onClick={() => setShowModal('transaction')} className="flex items-center gap-1 px-2 py-1 bg-indigo-600 rounded text-xs">
          <Plus size={12} /> {t.add}
        </button>
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
            {transactions.slice().reverse().map(tx => (
              <tr key={tx.id} className="border-t border-gray-700">
                <td className="p-2 text-gray-400">{tx.date}</td>
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
                  <button onClick={() => deleteTransaction(tx.id)} className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400">
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