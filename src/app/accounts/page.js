'use client';
import { useApp } from '@/context/AppContext';
import { formatDateDisplay } from '@/lib/date-helpers';
import { Plus, X, ChevronDown, ChevronUp, Edit3, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AccountsPage() {
  const { t, accounts, deleteAccount, deleteAccountTransaction, setConfirmDelete, setPaymentModal, setShowModal, setModalError } = useApp();
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredAccounts = accounts.filter(account => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;
    return `${account.name} ${account.description || ''}`.toLowerCase().includes(search);
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {t.accounts || 'Accounts'}{' '}
          <span className={`text-sm ${totalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ({t.balance || 'Balance'}: {totalBalance >= 0 ? '+' : ''}₹{Math.abs(totalBalance).toLocaleString('en-IN')})
          </span>
        </h2>
        <button onClick={() => { setModalError(null); setShowModal('account'); }} className="flex items-center gap-1 px-2 py-1 bg-emerald-600 rounded text-xs">
          <Plus size={12} /> {t.addAccount}
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>{t.noAccounts || 'No accounts. Import from Excel to get started.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.placeholders?.searchAccounts || 'Search accounts...'}
                className="min-w-[220px] max-w-sm flex-1 rounded border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="p-2 rounded bg-gray-700 hover:bg-gray-600"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {t.noResults || 'No matching accounts found.'}
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredAccounts.map(account => (
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
                      <p className={`font-bold ${getAccountBalance(account) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {getAccountBalance(account) >= 0 ? '+' : ''}₹{Math.abs(getAccountBalance(account)).toLocaleString('en-IN')}
                      </p>
                    </div>
                    {expanded[account.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>

                  {expanded[account.id] && (
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
                        {(!account.transactions || account.transactions.length === 0) && (
                          <button
                            onClick={() => setConfirmDelete({
                              message: `Delete account "${account.name}"?`,
                              onConfirm: () => deleteAccount(account.id),
                            })}
                            className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs flex items-center justify-center gap-1"
                          >
                            <X size={12} /> {t.delete || 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
