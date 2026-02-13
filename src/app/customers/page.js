'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AccountView from '@/components/AccountView';
import { Plus, Search } from 'lucide-react';

export default function CustomersPage() {
  const {
    t, customers, totalReceivables,
    getCustomerBalance, setShowModal,
    setPaymentModal, newSale, setNewSale,
  } = useApp();

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  if (selectedAccount) {
    return (
      <AccountView
        account={{ type: 'customer', ...selectedAccount }}
        onBack={() => setSelectedAccount(null)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {t.customers}{' '}
          <span className="text-cyan-400 text-sm">({t.receivables}: ₹{totalReceivables.toLocaleString('en-IN')})</span>
        </h2>
        <button onClick={() => setShowModal('customer')} className="flex items-center gap-1 px-2 py-1 bg-cyan-600 rounded text-xs">
          <Plus size={12} /> {t.add}
        </button>
      </div>
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t.placeholders.searchCustomers}
          className="w-full pl-8 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
        />
      </div>
      <div className="grid gap-2">
        {filteredCustomers.map(c => (
          <div key={c.id} onClick={() => setSelectedAccount(c)} className="bg-gray-800 rounded-xl p-2 cursor-pointer hover:ring-1 hover:ring-cyan-500/50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-gray-400 text-xs">{c.email}</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 font-bold">₹{getCustomerBalance(c.id).toLocaleString('en-IN')}</p>
                <p className="text-gray-500 text-xs">{t.receivable}</p>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <button onClick={e => { e.stopPropagation(); setNewSale({ ...newSale, customerId: c.id }); setShowModal('sale'); }} className="px-2 py-0.5 bg-blue-600 rounded text-xs">+ {t.sale}</button>
              <button onClick={e => { e.stopPropagation(); setPaymentModal({ type: 'customer', id: c.id, name: c.name }); }} className="px-2 py-0.5 bg-emerald-600 rounded text-xs">{t.receive}</button>
              <button onClick={e => { e.stopPropagation(); setSelectedAccount(c); }} className="px-2 py-0.5 bg-gray-700 rounded text-xs">{t.view}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
