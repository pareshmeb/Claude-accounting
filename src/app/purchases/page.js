'use client';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import { Plus, CreditCard } from 'lucide-react';

export default function PurchasesPage() {
  const {
    t, purchases, getTotal, getSupplier,
    setShowModal, setPaymentModal,
  } = useApp();

  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{t.purchases}</h2>
        <button onClick={() => setShowModal('purchase')} className="flex items-center gap-1 px-2 py-1 bg-purple-600 rounded text-xs">
          <Plus size={12} /> {t.new}
        </button>
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
            {purchases.slice().reverse().map(p => (
              <tr key={p.id} className="border-t border-gray-700">
                <td className="p-2 font-medium">{p.billNo}</td>
                <td className="p-2 cursor-pointer hover:text-purple-400" onClick={() => router.push(`/suppliers?account=${p.supplierId}`)}>
                  {getSupplier(p.supplierId)?.name}
                </td>
                <td className="p-2 text-gray-300 max-w-32 truncate" title={p.description}>{p.description || '-'}</td>
                <td className="p-2 text-gray-400">{p.date}</td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
