'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Wallet, LayoutDashboard, List, Building, Users, Package, ShoppingCart, UserX, UserCheck, CircleDot, Globe } from 'lucide-react';

export default function Sidebar() {
  const { t, lang, setLang } = useApp();
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: t.dashboard, href: '/' },
    { icon: List, label: t.transactions, href: '/transactions' },
    { icon: Building, label: t.suppliers, href: '/suppliers' },
    { icon: Users, label: t.customers, href: '/customers' },
    { icon: Package, label: t.purchases, href: '/purchases' },
    { icon: ShoppingCart, label: t.sales, href: '/sales' },
    { icon: UserX, label: t.creditors, href: '/creditors' },
    { icon: UserCheck, label: t.debtors, href: '/debtors' },
    { icon: CircleDot, label: t.reports, href: '/reports' },
  ];

  return (
    <div className="w-40 bg-gray-800 p-2 flex flex-col min-h-screen">
      <div className="flex items-center justify-between mb-3 p-1">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-600 rounded"><Wallet size={14} /></div>
          <h1 className="font-bold text-sm">{t.appName}</h1>
        </div>
      </div>
      <button
        onClick={() => setLang(lang === 'en' ? 'gu' : 'en')}
        className="flex items-center justify-center gap-1 mb-3 p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs"
      >
        <Globe size={12} /> {lang === 'en' ? 'ગુજરાતી' : 'English'}
      </button>
      <nav className="space-y-0.5 flex-1">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 w-full p-2 rounded-lg text-xs transition-all ${
              pathname === href
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon size={14} />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
