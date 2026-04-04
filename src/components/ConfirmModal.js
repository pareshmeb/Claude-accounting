'use client';
import { useApp } from '@/context/AppContext';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal() {
  const { t, confirmDelete, setConfirmDelete } = useApp();

  if (!confirmDelete) return null;

  const handleConfirm = () => {
    confirmDelete.onConfirm();
    setConfirmDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setConfirmDelete(null)}>
      <div className="bg-gray-800 rounded-xl p-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle size={16} />
            {t.confirmDelete}
          </h3>
          <button onClick={() => setConfirmDelete(null)} className="p-1 hover:bg-gray-700 rounded">
            <X size={14} />
          </button>
        </div>
        <p className="text-sm text-gray-300 mb-2">{confirmDelete.message}</p>
        <p className="text-xs text-gray-500 mb-4">{t.deleteWarning}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmDelete(null)}
            className="flex-1 p-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 p-2 bg-red-600 hover:bg-red-700 rounded font-medium text-sm"
          >
            {t.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
