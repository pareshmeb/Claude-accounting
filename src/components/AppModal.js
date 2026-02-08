'use client';
import { useApp } from '@/context/AppContext';
import { X } from 'lucide-react';

export default function AppModal() {
  const {
    t, showModal, setShowModal,
    suppliers, customers,
    newSupplier, setNewSupplier,
    newCustomer, setNewCustomer,
    newCreditor, setNewCreditor,
    newDebtor, setNewDebtor,
    newPurchase, setNewPurchase,
    newSale, setNewSale,
    newTx, setNewTx,
    addSupplierAction, addCustomerAction,
    addCreditorAction, addDebtorAction,
    addPurchaseAction, addSaleAction,
    addTransactionAction,
    addItem, updateItem, removeItem,
  } = useApp();

  if (!showModal) return null;

  const titles = {
    supplier: t.addSupplier,
    customer: t.addCustomer,
    purchase: t.newPurchase,
    sale: t.newSale,
    creditor: t.addCreditor,
    debtor: t.addDebtor,
    transaction: t.addTransaction,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(null)}>
      <div className="bg-gray-800 rounded-xl p-3 w-full max-w-md max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm">{titles[showModal]}</h3>
          <button onClick={() => setShowModal(null)} className="p-1 hover:bg-gray-700 rounded"><X size={16} /></button>
        </div>

        {showModal === 'supplier' && (
          <div className="space-y-2">
            <input type="text" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} placeholder={t.placeholders.name} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="email" value={newSupplier.email} onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} placeholder={t.placeholders.email} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="tel" value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} placeholder={t.placeholders.phone} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="text" value={newSupplier.address} onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} placeholder={t.placeholders.address} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <button onClick={addSupplierAction} className="w-full p-2 bg-orange-600 hover:bg-orange-700 rounded font-medium text-sm">{t.addSupplier}</button>
          </div>
        )}

        {showModal === 'customer' && (
          <div className="space-y-2">
            <input type="text" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} placeholder={t.placeholders.name} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} placeholder={t.placeholders.email} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder={t.placeholders.phone} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="text" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} placeholder={t.placeholders.address} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <button onClick={addCustomerAction} className="w-full p-2 bg-cyan-600 hover:bg-cyan-700 rounded font-medium text-sm">{t.addCustomer}</button>
          </div>
        )}

        {showModal === 'creditor' && (
          <div className="space-y-2">
            <input type="text" value={newCreditor.name} onChange={e => setNewCreditor({ ...newCreditor, name: e.target.value })} placeholder={t.placeholders.name} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="number" value={newCreditor.amount} onChange={e => setNewCreditor({ ...newCreditor, amount: e.target.value })} placeholder={t.placeholders.amountOwed} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="date" value={newCreditor.dueDate} onChange={e => setNewCreditor({ ...newCreditor, dueDate: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <textarea value={newCreditor.description} onChange={e => setNewCreditor({ ...newCreditor, description: e.target.value })} placeholder={t.placeholders.creditorDesc} className="w-full p-2 bg-gray-700 rounded text-sm" rows={2} />
            <button onClick={addCreditorAction} className="w-full p-2 bg-orange-600 hover:bg-orange-700 rounded font-medium text-sm">{t.addCreditor}</button>
          </div>
        )}

        {showModal === 'debtor' && (
          <div className="space-y-2">
            <input type="text" value={newDebtor.name} onChange={e => setNewDebtor({ ...newDebtor, name: e.target.value })} placeholder={t.placeholders.name} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="number" value={newDebtor.amount} onChange={e => setNewDebtor({ ...newDebtor, amount: e.target.value })} placeholder={t.placeholders.amountOwedToYou} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <input type="date" value={newDebtor.dueDate} onChange={e => setNewDebtor({ ...newDebtor, dueDate: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <textarea value={newDebtor.description} onChange={e => setNewDebtor({ ...newDebtor, description: e.target.value })} placeholder={t.placeholders.debtorDesc} className="w-full p-2 bg-gray-700 rounded text-sm" rows={2} />
            <button onClick={addDebtorAction} className="w-full p-2 bg-cyan-600 hover:bg-cyan-700 rounded font-medium text-sm">{t.addDebtor}</button>
          </div>
        )}

        {showModal === 'purchase' && (
          <div className="space-y-2">
            <select value={newPurchase.supplierId} onChange={e => setNewPurchase({ ...newPurchase, supplierId: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-sm">
              <option value="">{t.selectSupplier} *</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" value={newPurchase.date} onChange={e => setNewPurchase({ ...newPurchase, date: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <textarea value={newPurchase.description} onChange={e => setNewPurchase({ ...newPurchase, description: e.target.value })} placeholder={t.placeholders.purchaseDesc} className="w-full p-2 bg-gray-700 rounded text-sm" rows={2} />
            <p className="text-xs text-gray-400">{t.items}</p>
            {newPurchase.items.map((item, idx) => (
              <div key={idx} className="flex gap-1">
                <input type="text" value={item.name} onChange={e => updateItem('purchase', idx, 'name', e.target.value)} placeholder={t.placeholders.item} className="flex-1 p-2 bg-gray-700 rounded text-sm" />
                <input type="number" value={item.qty} onChange={e => updateItem('purchase', idx, 'qty', e.target.value)} placeholder={t.qty} className="w-14 p-2 bg-gray-700 rounded text-sm" />
                <input type="number" value={item.price} onChange={e => updateItem('purchase', idx, 'price', e.target.value)} placeholder={t.price} className="w-20 p-2 bg-gray-700 rounded text-sm" />
                {newPurchase.items.length > 1 && <button onClick={() => removeItem('purchase', idx)} className="p-2 text-red-400"><X size={14} /></button>}
              </div>
            ))}
            <button onClick={() => addItem('purchase')} className="text-xs text-purple-400">{t.addItem}</button>
            <div className="flex justify-between p-2 bg-gray-700 rounded">
              <span>{t.total}:</span>
              <span className="font-bold text-purple-400">₹{newPurchase.items.reduce((s, i) => s + (i.qty * (parseFloat(i.price) || 0)), 0).toLocaleString('en-IN')}</span>
            </div>
            <button onClick={addPurchaseAction} className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded font-medium text-sm">{t.newPurchase}</button>
          </div>
        )}

        {showModal === 'sale' && (
          <div className="space-y-2">
            <select value={newSale.customerId} onChange={e => setNewSale({ ...newSale, customerId: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-sm">
              <option value="">{t.selectCustomer} *</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={newSale.date} onChange={e => setNewSale({ ...newSale, date: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <textarea value={newSale.description} onChange={e => setNewSale({ ...newSale, description: e.target.value })} placeholder={t.placeholders.saleDesc} className="w-full p-2 bg-gray-700 rounded text-sm" rows={2} />
            <p className="text-xs text-gray-400">{t.items}</p>
            {newSale.items.map((item, idx) => (
              <div key={idx} className="flex gap-1">
                <input type="text" value={item.name} onChange={e => updateItem('sale', idx, 'name', e.target.value)} placeholder={t.placeholders.item} className="flex-1 p-2 bg-gray-700 rounded text-sm" />
                <input type="number" value={item.qty} onChange={e => updateItem('sale', idx, 'qty', e.target.value)} placeholder={t.qty} className="w-14 p-2 bg-gray-700 rounded text-sm" />
                <input type="number" value={item.price} onChange={e => updateItem('sale', idx, 'price', e.target.value)} placeholder={t.price} className="w-20 p-2 bg-gray-700 rounded text-sm" />
                {newSale.items.length > 1 && <button onClick={() => removeItem('sale', idx)} className="p-2 text-red-400"><X size={14} /></button>}
              </div>
            ))}
            <button onClick={() => addItem('sale')} className="text-xs text-blue-400">{t.addItem}</button>
            <div className="flex justify-between p-2 bg-gray-700 rounded">
              <span>{t.total}:</span>
              <span className="font-bold text-blue-400">₹{newSale.items.reduce((s, i) => s + (i.qty * (parseFloat(i.price) || 0)), 0).toLocaleString('en-IN')}</span>
            </div>
            <button onClick={addSaleAction} className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded font-medium text-sm">{t.newSale}</button>
          </div>
        )}

        {showModal === 'transaction' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button onClick={() => setNewTx({ ...newTx, type: 'expense', category: '' })} className={`flex-1 p-2 rounded text-xs font-medium ${newTx.type === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-gray-700 text-gray-400'}`}>{t.expense}</button>
              <button onClick={() => setNewTx({ ...newTx, type: 'income', category: '' })} className={`flex-1 p-2 rounded text-xs font-medium ${newTx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-gray-700 text-gray-400'}`}>{t.income}</button>
            </div>
            <input type="number" value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: e.target.value })} placeholder={t.placeholders.amount} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <select value={newTx.category} onChange={e => setNewTx({ ...newTx, category: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-sm">
              <option value="">{t.selectCategory} *</option>
              {t.categories[newTx.type].map((c, i) => <option key={i} value={i}>{c}</option>)}
            </select>
            <textarea value={newTx.description} onChange={e => setNewTx({ ...newTx, description: e.target.value })} placeholder={t.placeholders.description} className="w-full p-2 bg-gray-700 rounded text-sm" rows={2} />
            <input type="date" value={newTx.date} onChange={e => setNewTx({ ...newTx, date: e.target.value })} className="w-full p-2 bg-gray-700 rounded text-sm" />
            <button onClick={addTransactionAction} className="w-full p-2 bg-indigo-600 hover:bg-indigo-700 rounded font-medium text-sm">{t.addTransaction}</button>
          </div>
        )}
      </div>
    </div>
  );
}
