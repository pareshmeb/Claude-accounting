'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X } from 'lucide-react';

export default function AccountTransactionModal() {
  const { t, paymentModal, setPaymentModal, addAccountTransaction, updateAccountTransaction } = useApp();
  const [transactionType, setTransactionType] = useState('receipt');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentModal || paymentModal.type !== 'account-transaction') return;

    if (paymentModal.transaction) {
      setTransactionType(paymentModal.transaction.transactionType);
      setAmount(paymentModal.transaction.amount.toString());
      setDate(paymentModal.transaction.date);
      setDescription(paymentModal.transaction.description || '');
    } else {
      setTransactionType('receipt');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
  }, [paymentModal]);

  if (!paymentModal || paymentModal.type !== 'account-transaction') return null;

  const { id: accountId } = paymentModal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (paymentModal.transaction) {
        await updateAccountTransaction(
          accountId,
          paymentModal.transaction.id,
          transactionType,
          parseFloat(amount),
          date,
          description
        );
      } else {
        await addAccountTransaction(
          accountId,
          transactionType,
          parseFloat(amount),
          date,
          description
        );
      }

      setPaymentModal(null);
      setAmount('');
      setDescription('');
      setTransactionType('receipt');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPaymentModal(null)}>
      <div
        className="bg-gray-800 rounded-xl p-4 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-sm">Add Transaction</h2>
          <button
            onClick={() => setPaymentModal(null)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="p-2 mb-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Transaction Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('receipt')}
                className={`flex-1 p-2 rounded text-xs font-medium transition-colors ${
                  transactionType === 'receipt'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Receipt (+)
              </button>
              <button
                type="button"
                onClick={() => setTransactionType('payment')}
                className={`flex-1 p-2 rounded text-xs font-medium transition-colors ${
                  transactionType === 'payment'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Payment (-)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes"
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPaymentModal(null)}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 rounded text-xs font-medium"
            >
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
