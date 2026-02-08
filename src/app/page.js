'use client';
import { useApp } from '@/context/AppContext';
import StatCard from '@/components/StatCard';
import { Wallet, TrendingUp, TrendingDown, ShoppingCart, Package, UserX, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const {
    t, suppliers, customers,
    balance, totalIncome, totalExpense,
    totalSalesAmt, totalPurchasesAmt,
    totalPayables, totalReceivables,
    totalCreditorOwed, totalDebtorOwed,
    getSupplierBalance, getCustomerBalance,
  } = useApp();

  const router = useRouter();

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{t.dashboard}</h2>
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Wallet} label={t.balance} value={balance} color="text-indigo-400" />
        <StatCard icon={TrendingUp} label={t.income} value={totalIncome} color="text-emerald-400" />
        <StatCard icon={TrendingDown} label={t.expenses} value={totalExpense} color="text-red-400" />
        <StatCard icon={ShoppingCart} label={t.sales} value={totalSalesAmt} color="text-blue-400" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={Package} label={t.purchases} value={totalPurchasesAmt} color="text-purple-400" />
        <StatCard icon={UserX} label={t.payables} value={totalPayables + totalCreditorOwed} color="text-orange-400" />
        <StatCard icon={UserCheck} label={t.receivables} value={totalReceivables + totalDebtorOwed} color="text-cyan-400" />
        <StatCard icon={Wallet} label={t.net} value={balance - totalPayables - totalCreditorOwed + totalReceivables + totalDebtorOwed} color="text-emerald-400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-xl p-2">
          <h3 className="font-semibold text-sm mb-2">{t.topSuppliers}</h3>
          <div className="space-y-1">
            {suppliers.map(s => ({ ...s, balance: getSupplierBalance(s.id) })).sort((a, b) => b.balance - a.balance).slice(0, 3).map(s => (
              <div key={s.id} onClick={() => router.push(`/suppliers?account=${s.id}`)} className="flex justify-between items-center p-1.5 bg-gray-700 rounded cursor-pointer hover:bg-gray-600">
                <span>{s.name}</span>
                <span className="text-orange-400 font-semibold">₹{s.balance.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-2">
          <h3 className="font-semibold text-sm mb-2">{t.topCustomers}</h3>
          <div className="space-y-1">
            {customers.map(c => ({ ...c, balance: getCustomerBalance(c.id) })).sort((a, b) => b.balance - a.balance).slice(0, 3).map(c => (
              <div key={c.id} onClick={() => router.push(`/customers?account=${c.id}`)} className="flex justify-between items-center p-1.5 bg-gray-700 rounded cursor-pointer hover:bg-gray-600">
                <span>{c.name}</span>
                <span className="text-cyan-400 font-semibold">₹{c.balance.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
