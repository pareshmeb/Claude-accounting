'use client';
import { useApp } from '@/context/AppContext';
import { formatDateDisplay } from '@/lib/date-helpers';
import { Plus, X, Edit3, Trash2, ArrowLeft, Download } from 'lucide-react';
import { useState } from 'react';

function getBalance(account) {
  const txs = account.transactions || [];
  const receipts = txs.filter(t => t.transactionType === 'receipt').reduce((s, t) => s + t.amount, 0);
  const payments = txs.filter(t => t.transactionType === 'payment').reduce((s, t) => s + t.amount, 0);
  return receipts - payments;
}

function AccountDetail({ account, onBack }) {
  const { t, deleteAccount, deleteAccountTransaction, setConfirmDelete, setPaymentModal } = useApp();

  const sorted = [...(account.transactions || [])].sort((a, b) => new Date(a.date) - new Date(b.date));

  let running = 0;
  const ledger = sorted.map(tx => {
    running += tx.transactionType === 'receipt' ? tx.amount : -tx.amount;
    return { ...tx, balance: running };
  });

  const totalCredit = sorted.filter(t => t.transactionType === 'receipt').reduce((s, t) => s + t.amount, 0);
  const totalDebit = sorted.filter(t => t.transactionType === 'payment').reduce((s, t) => s + t.amount, 0);
  const balance = getBalance(account);

  const exportCsv = () => {
    const headers = [t.date || 'Date', t.description || 'Description', t.credit || 'Credit', t.debit || 'Debit', t.balance || 'Balance'];
    const rows = ledger.map(l => [
      formatDateDisplay(l.date),
      l.description || '',
      l.transactionType === 'receipt' ? l.amount : '',
      l.transactionType === 'payment' ? l.amount : '',
      l.balance,
    ]);
    const esc = (v) => { const s = String(v ?? ''); return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = [headers, ...rows].map(r => r.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${account.name.replace(/\s+/g, '_')}_ledger.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-white text-xs">
        <ArrowLeft size={14} /> {t.back || 'Back'}
      </button>

      <div className="bg-gray-800 rounded-xl p-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">{account.name}</h2>
            <p className="text-gray-400 text-xs">{account.description || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">{t.balance || 'Balance'}</p>
            <p className={`text-xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {balance >= 0 ? '+' : ''}₹{Math.abs(balance).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">{t.credit || 'Credit'}</p>
          <p className="font-bold text-emerald-400">₹{totalCredit.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">{t.debit || 'Debit'}</p>
          <p className="font-bold text-red-400">₹{totalDebit.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">{t.balance || 'Balance'}</p>
          <p className={`font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>₹{Math.abs(balance).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setPaymentModal({ type: 'account-transaction', id: account.id })}
          className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
        >
          <Plus size={12} /> {t.add || 'Add'}
        </button>
        {(!account.transactions || account.transactions.length === 0) && (
          <button
            onClick={() => setConfirmDelete({
              message: `Delete account "${account.name}"?`,
              onConfirm: () => { deleteAccount(account.id); onBack(); },
            })}
            className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            <Trash2 size={12} /> {t.delete || 'Delete'}
          </button>
        )}
        {ledger.length > 0 && (
          <button
            onClick={exportCsv}
            className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs ml-auto"
          >
            <Download size={12} /> {t.exportCsv || 'Export CSV'}
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-2">
        <h3 className="font-semibold text-sm mb-2">{t.accountLedger || 'Account Ledger'}</h3>
        {ledger.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-1.5">{t.date || 'Date'}</th>
                  <th className="text-left p-1.5">{t.description || 'Description'}</th>
                  <th className="text-right p-1.5">{t.credit || 'Credit'}</th>
                  <th className="text-right p-1.5">{t.debit || 'Debit'}</th>
                  <th className="text-right p-1.5">{t.balance || 'Balance'}</th>
                  <th className="p-1.5"></th>
                </tr>
              </thead>
              <tbody>
                {ledger.map(tx => (
                  <tr key={tx.id} className="border-t border-gray-700">
                    <td className="p-1.5 text-gray-400">{formatDateDisplay(tx.date)}</td>
                    <td className="p-1.5 text-gray-300 max-w-[140px] truncate" title={tx.description}>{tx.description || '-'}</td>
                    <td className="p-1.5 text-right text-emerald-400">
                      {tx.transactionType === 'receipt' ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="p-1.5 text-right text-red-400">
                      {tx.transactionType === 'payment' ? `₹${tx.amount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className={`p-1.5 text-right font-semibold ${tx.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹{Math.abs(tx.balance).toLocaleString('en-IN')}
                    </td>
                    <td className="p-1.5">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => setPaymentModal({ type: 'account-transaction', id: account.id, transaction: tx })}
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600"
                          aria-label="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({
                            message: `Delete transaction from ${account.name}?`,
                            onConfirm: () => deleteAccountTransaction(account.id, tx.id),
                          })}
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600"
                          aria-label="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-2">{t.noTransactions || 'No transactions'}</p>
        )}
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const { t, accounts, setShowModal, setModalError } = useApp();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  // Keep selected in sync when accounts update (e.g. after adding a transaction)
  const selectedAccount = selected ? accounts.find(a => a.id === selected.id) || selected : null;

  if (selectedAccount) {
    return <AccountDetail account={selectedAccount} onBack={() => setSelected(null)} />;
  }

  const totalBalance = accounts.reduce((s, a) => s + getBalance(a), 0);

  const filtered = accounts.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return `${a.name} ${a.description || ''}`.toLowerCase().includes(q);
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
          <Plus size={12} /> {t.addAccount || 'Add'}
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>{t.noAccounts || 'No accounts. Import from Excel to get started.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.placeholders?.searchAccounts || 'Search accounts...'}
              className="min-w-[220px] max-w-sm flex-1 rounded border border-gray-700 bg-gray-900 px-2 py-1 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {search && (
              <button onClick={() => setSearch('')} className="p-2 rounded bg-gray-700 hover:bg-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-400">{t.noResults || 'No matching accounts found.'}</div>
          ) : (
            <div className="grid gap-2">
              {filtered.map(account => {
                const bal = getBalance(account);
                return (
                  <div
                    key={account.id}
                    onClick={() => setSelected(account)}
                    className="bg-gray-800 rounded-xl p-3 cursor-pointer hover:ring-1 hover:ring-emerald-500/50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <p className="text-gray-400 text-xs mt-0.5">{account.description || ''}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${bal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {bal >= 0 ? '+' : ''}₹{Math.abs(bal).toLocaleString('en-IN')}
                        </p>
                        <p className="text-gray-500 text-xs">{(account.transactions || []).length} txn</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
