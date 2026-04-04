'use client';
import { useApp } from '@/context/AppContext';
import { formatDateDisplay } from '@/lib/date-helpers';
import { Plus, X, ChevronDown, ChevronUp, Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AccountsPage() {
  const { t, accounts, deleteAccount, deleteAccountTransaction, setConfirmDelete, setPaymentModal } = useApp();
  const [expanded, setExpanded] = useState({});

  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => {
    const transactions = acc.transactions || [];
    const payments = transactions.filter(t => t.transactionType === 'payment').reduce((s, t) => s + t.amount, 0);
    const receipts = transactions.filter(t => t.transactionType === 'receipt').reduce((s, t) => s + t.amount, 0);
    return sum + (receipts - payments);
  }, 0);

  const getAccountBalance = (account) => {
    const transactions = account.transactions || [];
    const payments = transactions.filter(t => t.transactionType === 'payment').reduce((s, t) => s + t.amount, 0);
    const receipts = transactions.filter(t => t.transactionType === 'receipt').reduce((s, t) => s + t.amount, 0);
    return receipts - payments;
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {t.accounts || 'Accounts'}{' '}
          <span className={`text-sm ${totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ({t.balance || 'Balance'}: {totalBalance >= 0 ? '+' : ''}₹{Math.abs(totalBalance).toLocaleString('en-IN')})
          </span>
        </h2>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>{t.noAccounts || 'No accounts. Import from Excel to get started.'}</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {accounts.map(account => {
            const balance = getAccountBalance(account);
            const isExpanded = expanded[account.id];

            return (
              <div key={account.id} className="border border-gray-600 rounded-xl p-3 bg-gray-800/50">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpanded(account.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{account.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{account.description || t.noDescription || 'No description'}</p>
                  </div>
                  <div className="text-right mr-2">
                    <p className={`font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {balance >= 0 ? '+' : ''}₹{Math.abs(balance).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    {account.transactions && account.transactions.length > 0 ? (
                      <div className="space-y-1">
                        {account.transactions.map(tx => (
                          <div key={tx.id} className="flex items-center justify-between text-xs py-1 gap-2">
                            <div className="min-w-[80px] text-gray-300">{formatDateDisplay(tx.date)}</div>
                            <div className="flex-1 mx-2 truncate text-gray-400">{tx.description || '-'}</div>
                            <div className={tx.transactionType === 'receipt' ? 'text-emerald-400' : 'text-red-400'}>
                              {tx.transactionType === 'receipt' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => setPaymentModal({ type: 'account-transaction', id: account.id, transaction: tx })}
                                className="p-1 rounded bg-gray-700 hover:bg-gray-600"
                                aria-label="Edit transaction"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDelete({
                                  message: `Delete transaction from ${account.name}?`,
                                  onConfirm: () => deleteAccountTransaction(account.id, tx.id),
                                })}
                                className="p-1 rounded bg-gray-700 hover:bg-gray-600"
                                aria-label="Delete transaction"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">{t.noTransactions || 'No transactions'}</p>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-600 flex gap-1">
                      <button
                        onClick={() => setPaymentModal({ type: 'account-transaction', id: account.id })}
                        className="flex-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs flex items-center justify-center gap-1"
                      >
                        <Plus size={12} /> {t.add || 'Add'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete({
                          message: `Delete account "${account.name}"? This will remove all transactions.`,
                          onConfirm: () => deleteAccount(account.id),
                        })}
                        className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs flex items-center justify-center gap-1"
                      >
                        <X size={12} /> {t.delete || 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
