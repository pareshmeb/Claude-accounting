'use client';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Plus, CreditCard, Download } from 'lucide-react';

export default function AccountView({ account, onBack }) {
  const {
    t, lang, purchases, sales, supplierPayments, customerPayments,
    getTotal, getSupplierBalance, getCustomerBalance,
    setShowModal, setPaymentModal, newPurchase, setNewPurchase, newSale, setNewSale,
  } = useApp();

  const isSupplier = account.type === 'supplier';
  const accountPurchases = isSupplier ? purchases.filter(p => p.supplierId === account.id) : [];
  const accountSales = !isSupplier ? sales.filter(s => s.customerId === account.id) : [];
  const accountPayments = isSupplier
    ? supplierPayments.filter(p => p.supplierId === account.id)
    : customerPayments.filter(p => p.customerId === account.id);
  const bal = isSupplier ? getSupplierBalance(account.id) : getCustomerBalance(account.id);
  const totalTx = isSupplier
    ? accountPurchases.reduce((s, p) => s + getTotal(p.items), 0)
    : accountSales.reduce((s, sale) => s + getTotal(sale.items), 0);
  const totalPaid = accountPayments.reduce((s, p) => s + p.amount, 0);

  const ledger = [
    ...(isSupplier
      ? accountPurchases.map(p => ({ date: p.date, type: 'purchase', ref: p.billNo, desc: p.description, debit: getTotal(p.items), credit: 0 }))
      : accountSales.map(s => ({ date: s.date, type: 'sale', ref: s.invoiceNo, desc: s.description, debit: getTotal(s.items), credit: 0 }))),
    ...accountPayments.map(p => ({ date: p.date, type: 'payment', ref: p.reference, desc: p.description, debit: 0, credit: p.amount }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBal = 0;
  ledger.forEach(l => { runningBal += l.debit - l.credit; l.balance = runningBal; });

  const exportCsv = () => {
    const headers = [t.date, t.type, t.ref, t.description, t.debit, t.credit, t.balance];
    const rows = ledger.map(l => [
      l.date,
      l.type === 'payment' ? t.payment : l.type === 'purchase' ? t.purchase : t.sale,
      l.ref || '',
      l.desc || '',
      l.debit || '',
      l.credit || '',
      l.balance,
    ]);
    const escapeCsv = (v) => {
      const s = String(v ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [headers, ...rows].map(r => r.map(escapeCsv).join(',')).join('\n');
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
        <ArrowLeft size={14} /> {t.back}
      </button>
      <div className="bg-gray-800 rounded-xl p-3">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">{account.name}</h2>
            <p className="text-gray-400 text-xs">{account.email} • {account.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">{t.balance}</p>
            <p className={`text-xl font-bold ${isSupplier ? 'text-orange-400' : 'text-cyan-400'}`}>
              ₹{bal.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">{isSupplier ? t.purchases : t.sales}</p>
          <p className={`font-bold ${isSupplier ? 'text-purple-400' : 'text-blue-400'}`}>₹{totalTx.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">{isSupplier ? t.paid : (lang === 'gu' ? 'મળેલ' : 'Received')}</p>
          <p className="font-bold text-emerald-400">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">{t.outstanding}</p>
          <p className="font-bold text-yellow-400">₹{bal.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            isSupplier
              ? setNewPurchase({ ...newPurchase, supplierId: account.id })
              : setNewSale({ ...newSale, customerId: account.id });
            setShowModal(isSupplier ? 'purchase' : 'sale');
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isSupplier ? 'bg-purple-600' : 'bg-blue-600'}`}
        >
          <Plus size={12} /> {isSupplier ? t.purchase : t.sale}
        </button>
        <button
          onClick={() => setPaymentModal({ type: isSupplier ? 'supplier' : 'customer', id: account.id, name: account.name })}
          className="flex items-center gap-1 px-2 py-1 bg-emerald-600 rounded text-xs"
        >
          <CreditCard size={12} /> {isSupplier ? t.pay : t.receive}
        </button>
        {ledger.length > 0 && (
          <button
            onClick={exportCsv}
            className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs ml-auto"
          >
            <Download size={12} /> {t.exportCsv}
          </button>
        )}
      </div>
      <div className="bg-gray-800 rounded-xl p-2">
        <h3 className="font-semibold text-sm mb-2">{t.accountLedger}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-1.5">{t.date}</th>
                <th className="text-left p-1.5">{t.type}</th>
                <th className="text-left p-1.5">{t.ref}</th>
                <th className="text-left p-1.5">{t.description}</th>
                <th className="text-right p-1.5">{t.debit}</th>
                <th className="text-right p-1.5">{t.credit}</th>
                <th className="text-right p-1.5">{t.balance}</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((l, i) => (
                <tr key={i} className="border-t border-gray-700">
                  <td className="p-1.5 text-gray-400">{l.date}</td>
                  <td className="p-1.5">
                    <span className={`px-1 py-0.5 rounded text-xs ${
                      l.type === 'payment'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isSupplier
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {l.type === 'payment' ? t.payment : l.type === 'purchase' ? t.purchase : t.sale}
                    </span>
                  </td>
                  <td className="p-1.5">{l.ref}</td>
                  <td className="p-1.5 text-gray-300 max-w-32 truncate" title={l.desc}>{l.desc || '-'}</td>
                  <td className="p-1.5 text-right text-red-400">{l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN')}` : '-'}</td>
                  <td className="p-1.5 text-right text-emerald-400">{l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN')}` : '-'}</td>
                  <td className={`p-1.5 text-right font-semibold ${l.balance > 0 ? (isSupplier ? 'text-orange-400' : 'text-cyan-400') : 'text-gray-400'}`}>
                    ₹{l.balance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
