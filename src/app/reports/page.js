'use client';
import { useApp } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const {
    t, totalIncome, totalExpense, balance,
    totalSalesAmt, totalPurchasesAmt,
    totalPayables, totalReceivables,
    totalCreditorOwed, totalDebtorOwed,
  } = useApp();

  const chartData = [
    { name: t.sales, amt: totalSalesAmt },
    { name: t.purchases, amt: totalPurchasesAmt },
    { name: t.payables, amt: totalPayables + totalCreditorOwed },
    { name: t.receivables, amt: totalReceivables + totalDebtorOwed },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">{t.reports}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-xl p-3">
          <h3 className="font-semibold text-sm mb-2">{t.financialSummary}</h3>
          <div className="space-y-1">
            <div className="flex justify-between p-1.5 bg-gray-700 rounded">
              <span className="text-gray-400">{t.income}</span>
              <span className="text-emerald-400 font-semibold">₹{totalIncome.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-gray-700 rounded">
              <span className="text-gray-400">{t.expenses}</span>
              <span className="text-red-400 font-semibold">₹{totalExpense.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-indigo-600/20 rounded border border-indigo-500/30">
              <span className="text-indigo-300">{t.balance}</span>
              <span className="font-bold text-indigo-400">₹{balance.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-blue-500/20 rounded">
              <span className="text-blue-300">{t.sales}</span>
              <span className="text-blue-400 font-bold">₹{totalSalesAmt.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-purple-500/20 rounded">
              <span className="text-purple-300">{t.purchases}</span>
              <span className="text-purple-400 font-bold">₹{totalPurchasesAmt.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-orange-500/20 rounded">
              <span className="text-orange-300">{t.payables}</span>
              <span className="text-orange-400 font-bold">₹{(totalPayables + totalCreditorOwed).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-cyan-500/20 rounded">
              <span className="text-cyan-300">{t.receivables}</span>
              <span className="text-cyan-400 font-bold">₹{(totalReceivables + totalDebtorOwed).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-3">
          <h3 className="font-semibold text-sm mb-2">{t.overview}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={9} />
              <YAxis stroke="#9ca3af" fontSize={9} />
              <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
              <Bar dataKey="amt" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
