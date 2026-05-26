'use client';
import { useApp } from '@/context/AppContext';
import { X, Check } from 'lucide-react';

export default function PaymentModal() {
  const {
    t, paymentModal, setPaymentModal,
    paymentAmount, setPaymentAmount,
    paymentDesc, setPaymentDesc,
    paymentDate, setPaymentDate,
    makePaymentAction,
  } = useApp();

  if (!paymentModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPaymentModal(null)}>
      <div className="bg-gray-800 rounded-xl p-3 w-full max-w-xs" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm">
            {paymentModal.type === 'supplier' || paymentModal.type === 'creditor' ? t.makePayment : t.receivePayment}
          </h3>
          <button onClick={() => setPaymentModal(null)} className="p-1 hover:bg-gray-700 rounded"><X size={14} /></button>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            {paymentModal.type === 'supplier' || paymentModal.type === 'creditor' ? t.to : t.from}:{' '}
            <span className="text-white font-semibold">{paymentModal.name}</span>
          </p>
          {paymentModal.max && (
            <p className="text-gray-400">
              {t.outstanding}: <span className="text-yellow-400 font-semibold">₹{paymentModal.max?.toLocaleString('en-IN')}</span>
            </p>
          )}
          <input
            type="date"
            value={paymentDate}
            onChange={e => setPaymentDate(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-sm"
          />
          <input
            type="number"
            value={paymentAmount}
            onChange={e => setPaymentAmount(e.target.value)}
            placeholder={t.placeholders.amount}
            className="w-full p-2 bg-gray-700 rounded text-sm"
          />
          <textarea
            value={paymentDesc}
            onChange={e => setPaymentDesc(e.target.value)}
            placeholder={t.placeholders.paymentDesc}
            className="w-full p-2 bg-gray-700 rounded text-sm"
            rows={2}
          />
          <button
            onClick={makePaymentAction}
            className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 rounded font-medium text-sm flex items-center justify-center gap-1"
          >
            <Check size={14} /> {t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
