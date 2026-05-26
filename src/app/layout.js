import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import AppModal from '@/components/AppModal';
import PaymentModal from '@/components/PaymentModal';
import AccountTransactionModal from '@/components/AccountTransactionModal';
import ImportModal from '@/components/ImportModal';
import ConfirmModal from '@/components/ConfirmModal';

export const metadata = {
  title: 'AccuBooks - Accounting App',
  description: 'A comprehensive accounting application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div className="flex h-screen bg-gray-900 text-white text-xs">
            <Sidebar />
            <main className="flex-1 overflow-auto p-3">
              {children}
            </main>
          </div>
          <AppModal />
          <PaymentModal />
          <AccountTransactionModal />
          <ImportModal />
          <ConfirmModal />
        </AppProvider>
      </body>
    </html>
  );
}
