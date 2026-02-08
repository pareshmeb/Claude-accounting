'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import AccountView from '@/components/AccountView';
import { Plus } from 'lucide-react';

export default function SuppliersPage() {
  const {
    t, suppliers, totalPayables,
    getSupplierBalance, setShowModal,
    setPaymentModal, newPurchase, setNewPurchase,
  } = useApp();

  const [selectedAccount, setSelectedAccount] = useState(null);

  if (selectedAccount) {
    return (
      <AccountView
        account={{ type: 'supplier', ...selectedAccount }}
        onBack={() => setSelectedAccount(null)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {t.suppliers}{' '}
          <span className="text-orange-400 text-sm">({t.payables}: ₹{totalPayables.toLocaleString('en-IN')})</span>
        </h2>
        <button onClick={() => setShowModal('supplier')} className="flex items-center gap-1 px-2 py-1 bg-orange-600 rounded text-xs">
          <Plus size={12} /> {t.add}
        </button>
      </div>
      <div className="grid gap-2">
        {suppliers.map(s => (
          <div key={s.id} onClick={() => setSelectedAccount(s)} className="bg-gray-800 rounded-xl p-2 cursor-pointer hover:ring-1 hover:ring-orange-500/50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-gray-400 text-xs">{s.email}</p>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-bold">₹{getSupplierBalance(s.id).toLocaleString('en-IN')}</p>
                <p className="text-gray-500 text-xs">{t.owed}</p>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <button onClick={e => { e.stopPropagation(); setNewPurchase({ ...newPurchase, supplierId: s.id }); setShowModal('purchase'); }} className="px-2 py-0.5 bg-purple-600 rounded text-xs">+ {t.purchase}</button>
              <button onClick={e => { e.stopPropagation(); setPaymentModal({ type: 'supplier', id: s.id, name: s.name }); }} className="px-2 py-0.5 bg-emerald-600 rounded text-xs">{t.pay}</button>
              <button onClick={e => { e.stopPropagation(); setSelectedAccount(s); }} className="px-2 py-0.5 bg-gray-700 rounded text-xs">{t.view}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
