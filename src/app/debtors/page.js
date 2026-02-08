'use client';
import { useApp } from '@/context/AppContext';
import { Plus, X } from 'lucide-react';

export default function DebtorsPage() {
  const {
    t, debtors, debtorReceipts,
    totalDebtorOwed, setShowModal,
    setPaymentModal, deleteDebtor,
  } = useApp();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {t.debtors}{' '}
          <span className="text-cyan-400 text-sm">({t.owed}: ₹{totalDebtorOwed.toLocaleString('en-IN')})</span>
        </h2>
        <button onClick={() => setShowModal('debtor')} className="flex items-center gap-1 px-2 py-1 bg-cyan-600 rounded text-xs">
          <Plus size={12} /> {t.add}
        </button>
      </div>
      <div className="grid gap-2">
        {debtors.map(d => (
          <div key={d.id} className="bg-gray-800 rounded-xl p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{d.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{d.description || t.noDescription}</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 font-bold">₹{(d.amount - d.received).toLocaleString('en-IN')}</p>
                <p className="text-gray-500 text-xs">{t.of} ₹{d.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full mb-2">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(d.received / d.amount) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">{t.due}: {d.dueDate || t.notSet}</span>
              <div className="flex gap-1">
                <button onClick={() => setPaymentModal({ type: 'debtor', id: d.id, name: d.name, max: d.amount - d.received })} className="px-2 py-0.5 bg-cyan-600 rounded text-xs">{t.receive}</button>
                <button onClick={() => deleteDebtor(d.id)} className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"><X size={12} /></button>
              </div>
            </div>
            {debtorReceipts.filter(r => r.debtorId === d.id).length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-gray-400 text-xs mb-1">{t.receiptHistory}:</p>
                {debtorReceipts.filter(r => r.debtorId === d.id).map(r => (
                  <div key={r.id} className="flex justify-between text-xs py-0.5">
                    <span className="text-gray-500">{r.date}</span>
                    <span className="text-gray-400 flex-1 mx-2 truncate">{r.description || '-'}</span>
                    <span className="text-emerald-400">₹{r.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
