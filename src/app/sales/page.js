'use client';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import { Plus, CreditCard } from 'lucide-react';

export default function SalesPage() {
  const {
    t, sales, getTotal, getCustomer,
    setShowModal, setPaymentModal,
  } = useApp();

  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{t.sales}</h2>
        <button onClick={() => setShowModal('sale')} className="flex items-center gap-1 px-2 py-1 bg-blue-600 rounded text-xs">
          <Plus size={12} /> {t.new}
        </button>
      </div>
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left p-2">{t.invoice}</th>
              <th className="text-left p-2">{t.customer}</th>
              <th className="text-left p-2">{t.description}</th>
              <th className="text-left p-2">{t.date}</th>
              <th className="text-right p-2">{t.total}</th>
              <th className="text-right p-2">{t.paid}</th>
              <th className="p-2">{t.status}</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {sales.slice().reverse().map(s => (
              <tr key={s.id} className="border-t border-gray-700">
                <td className="p-2 font-medium">{s.invoiceNo}</td>
                <td className="p-2 cursor-pointer hover:text-blue-400" onClick={() => router.push(`/customers?account=${s.customerId}`)}>
                  {getCustomer(s.customerId)?.name}
                </td>
                <td className="p-2 text-gray-300 max-w-32 truncate" title={s.description}>{s.description || '-'}</td>
                <td className="p-2 text-gray-400">{s.date}</td>
                <td className="p-2 text-right text-blue-400 font-semibold">₹{getTotal(s.items).toLocaleString('en-IN')}</td>
                <td className="p-2 text-right text-emerald-400">₹{s.paidAmount.toLocaleString('en-IN')}</td>
                <td className="p-2"><StatusBadge status={s.status} /></td>
                <td className="p-2 flex gap-1">
                  {s.status !== 'paid' && (
                    <button
                      onClick={() => setPaymentModal({
                        type: 'customer',
                        id: s.customerId,
                        name: getCustomer(s.customerId)?.name,
                        invoiceNo: s.invoiceNo,
                        max: getTotal(s.items) - s.paidAmount,
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
