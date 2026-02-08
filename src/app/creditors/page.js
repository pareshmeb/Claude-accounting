'use client';
import { useApp } from '@/context/AppContext';
import { Plus, X } from 'lucide-react';

export default function CreditorsPage() {
  const {
    t, creditors, creditorPayments,
    totalCreditorOwed, setShowModal,
    setPaymentModal, deleteCreditor,
  } = useApp();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {t.creditors}{' '}
          <span className="text-orange-400 text-sm">({t.owed}: ₹{totalCreditorOwed.toLocaleString('en-IN')})</span>
        </h2>
        <button onClick={() => setShowModal('creditor')} className="flex items-center gap-1 px-2 py-1 bg-orange-600 rounded text-xs">
          <Plus size={12} /> {t.add}
        </button>
      </div>
      <div className="grid gap-2">
        {creditors.map(c => (
          <div key={c.id} className="bg-gray-800 rounded-xl p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{c.description || t.noDescription}</p>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-bold">₹{(c.amount - c.paid).toLocaleString('en-IN')}</p>
                <p className="text-gray-500 text-xs">{t.of} ₹{c.amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full mb-2">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(c.paid / c.amount) * 100}%` }} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">{t.due}: {c.dueDate || t.notSet}</span>
              <div className="flex gap-1">
                <button onClick={() => setPaymentModal({ type: 'creditor', id: c.id, name: c.name, max: c.amount - c.paid })} className="px-2 py-0.5 bg-orange-600 rounded text-xs">{t.pay}</button>
                <button onClick={() => deleteCreditor(c.id)} className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"><X size={12} /></button>
              </div>
            </div>
            {creditorPayments.filter(p => p.creditorId === c.id).length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-gray-400 text-xs mb-1">{t.paymentHistory}:</p>
                {creditorPayments.filter(p => p.creditorId === c.id).map(p => (
                  <div key={p.id} className="flex justify-between text-xs py-0.5">
                    <span className="text-gray-500">{p.date}</span>
                    <span className="text-gray-400 flex-1 mx-2 truncate">{p.description || '-'}</span>
                    <span className="text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</span>
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
