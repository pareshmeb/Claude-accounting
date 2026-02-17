'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import AccountView from '@/components/AccountView';
import SearchBox from '@/components/SearchBox';
import { Plus } from 'lucide-react';

export default function CustomersPage() {
  const {
    t, customers, totalReceivables,
    getCustomerBalance, setShowModal,
    setPaymentModal, newSale, setNewSale,
  } = useApp();

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [search, setSearch] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
  }, [customers, search]);

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
      <SearchBox value={search} onChange={setSearch} placeholder={t.searchByNameEmail} />
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
        {filteredCustomers.length === 0 && search && (
          <p className="text-center text-gray-500 text-sm py-4">{t.noResults}</p>
        )}
      </div>
    </div>
  );
}
