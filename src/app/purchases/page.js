'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import SearchBox from '@/components/SearchBox';
import { formatDate } from '@/lib/formatDate';
import { Plus, CreditCard, Calendar, X } from 'lucide-react';

export default function PurchasesPage() {
  const {
    t, purchases, getTotal, getSupplier,
    setShowModal, setPaymentModal,
  } = useApp();

  const router = useRouter();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (fromDate && p.date < fromDate) return false;
      if (toDate && p.date > toDate) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.billNo?.toLowerCase().includes(q) ||
          getSupplier(p.supplierId)?.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [purchases, search, fromDate, toDate, getSupplier]);

  const clearDateFilters = () => {
    setFromDate('');
    setToDate('');
  };

  const hasDateFilter = fromDate || toDate;
  const hasAnyFilter = hasDateFilter || search;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{t.purchases}</h2>
        <button onClick={() => setShowModal('purchase')} className="flex items-center gap-1 px-2 py-1 bg-purple-600 rounded text-xs">
          <Plus size={12} /> {t.new}
        </button>
      </div>
      <SearchBox value={search} onChange={setSearch} placeholder={t.searchByNameDesc} />

      {/* Date Filter Box */}
      <div className="bg-gray-800 rounded-xl p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar size={14} />
            <span className="text-xs font-medium">{t.filterByDate}</span>
          </div>
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500">{t.from}</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-gray-500">{t.to}</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {hasDateFilter && (
              <button
                onClick={clearDateFilters}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X size={12} /> {t.clear}
              </button>
            )}
          </div>
          {hasAnyFilter && (
            <span className="text-xs text-gray-500 ml-auto">
              {filteredPurchases.length} {t.of} {purchases.length}
            </span>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left p-2">{t.bill}</th>
              <th className="text-left p-2">{t.supplier}</th>
              <th className="text-left p-2">{t.description}</th>
              <th className="text-left p-2">{t.date}</th>
              <th className="text-right p-2">{t.total}</th>
              <th className="text-right p-2">{t.paid}</th>
              <th className="p-2">{t.status}</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.slice().reverse().map(p => (
              <tr key={p.id} className="border-t border-gray-700">
                <td className="p-2 font-medium">{p.billNo}</td>
                <td className="p-2 cursor-pointer hover:text-purple-400" onClick={() => router.push(`/suppliers?account=${p.supplierId}`)}>
                  {getSupplier(p.supplierId)?.name}
                </td>
                <td className="p-2 text-gray-300 max-w-32 truncate" title={p.description}>{p.description || '-'}</td>
                <td className="p-2 text-gray-400">{formatDate(p.date)}</td>
                <td className="p-2 text-right text-purple-400 font-semibold">₹{getTotal(p.items).toLocaleString('en-IN')}</td>
                <td className="p-2 text-right text-emerald-400">₹{p.paidAmount.toLocaleString('en-IN')}</td>
                <td className="p-2"><StatusBadge status={p.status} /></td>
                <td className="p-2 flex gap-1">
                  {p.status !== 'paid' && (
                    <button
                      onClick={() => setPaymentModal({
                        type: 'supplier',
                        id: p.supplierId,
                        name: getSupplier(p.supplierId)?.name,
                        billNo: p.billNo,
                        max: getTotal(p.items) - p.paidAmount,
                      })}
                      className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"
                    >
                      <CreditCard size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredPurchases.length === 0 && hasAnyFilter && (
              <tr><td colSpan={8} className="text-center text-gray-500 text-sm py-4">{t.noResults}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
