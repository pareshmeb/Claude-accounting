'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Upload, FileSpreadsheet, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

const SKIP_SHEETS = ['MASTER', 'Names', 'INDEX'];

function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  console.log('parseExcel: workbook sheets', wb.SheetNames);
  const accounts = [];

  for (const sheetName of wb.SheetNames) {
    const isSkipped = SKIP_SHEETS.includes(sheetName);
    console.log(`parseExcel: checking sheet ${sheetName} skipped=${isSkipped}`);
    if (isSkipped) continue;

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
    console.log(`parseExcel: sheet ${sheetName} row count`, rows.length, 'sample', rows.slice(0, 8));

    // Row 2 (index 1): "Account of" | <Name>
    const name = rows[1]?.[1] || sheetName;
    console.log(`parseExcel: sheet ${sheetName} parsed name`, name);
    if (!name) {
      console.log(`parseExcel: sheet ${sheetName} no name found, skipping`);
      continue;
    }

    // Row 6+ (index 5+): data rows (Date, Particulars, Received, Payment, Balance)
    const entries = [];
    let totalReceived = 0;
    let totalPayment = 0;

    for (let i = 5; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        //console.log(`parseExcel: sheet ${sheetName} skipping row ${i} completely empty`, row);
        continue;
      }
      if (!row[0]) {
        //console.log(`parseExcel: sheet ${sheetName} skipping row ${i} missing date`, row);
        continue;
      }

      const dateRaw = row[0];
      let date;
      if (dateRaw instanceof Date) {
        date = dateRaw.toISOString().split('T')[0];
      } else if (typeof dateRaw === 'string' && dateRaw.match(/^\d{4}-\d{2}-\d{2}/)) {
        date = dateRaw.substring(0, 10);
      } else if (typeof dateRaw === 'string' && dateRaw.match(/^\d+\/\d+\/\d+/)) {
        const d = new Date(dateRaw);
        date = isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
      } else {
        // Try parsing Excel serial number
        const serial = parseFloat(dateRaw);
        if (!isNaN(serial) && serial > 10000) {
          const d = new Date((serial - 25569) * 86400 * 1000);
          date = d.toISOString().split('T')[0];
        } else {
          console.log(`parseExcel: sheet ${sheetName} row ${i} date parse failed`, dateRaw);
          continue;
        }
      }

      if (!date) {
        console.log(`parseExcel: sheet ${sheetName} row ${i} invalid date`, dateRaw);
        continue;
      }

      const description = row[1] || '';
      const received = parseFloat(String(row[2] || '').replace(/[₹\s,]/g, '')) || 0;
      const payment = parseFloat(String(row[3] || '').replace(/[₹\s,]/g, '')) || 0;
      if (received === 0 && payment === 0) {
        console.log(`parseExcel: sheet ${sheetName} row ${i} zero values`, { received, payment, row });
        continue;
      }

      totalReceived += received;
      totalPayment += payment;
      entries.push({ date, description, received, payment });
    }

    console.log(`parseExcel: sheet ${sheetName} entries length`, entries.length);
    if (entries.length === 0) continue;

    // Calculate net balance (positive = money owed to us, negative = we owe money)
    const balance = totalReceived - totalPayment;

    accounts.push({
      name,
      balance: Math.abs(balance),
      totalReceived,
      totalPayment,
      entries,
    });
  }

  console.log('parseExcel: accounts parsed', accounts.length);
  return accounts;
}

export default function ImportModal() {
  const { t, showImportModal, setShowImportModal } = useApp();
  const [accounts, setAccounts] = useState([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!showImportModal) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setDone(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const parsed = parseExcel(data);
        if (parsed.length === 0) {
          setError(t.noDataFound);
        } else {
          setAccounts(parsed);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    setImporting(true);
    setError('');
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts }),
      });
      if (!res.ok) throw new Error('Import failed');
      setDone(true);
      // Reload page to refresh all data from DB
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setShowImportModal(false);
    setAccounts([]);
    setDone(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-gray-800 rounded-xl p-4 w-full max-w-lg max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-emerald-400" />
            {t.importExcel}
          </h3>
          <button onClick={handleClose} className="p-1 hover:bg-gray-700 rounded"><X size={16} /></button>
        </div>

        {/* File picker */}
        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors mb-4">
          <Upload size={18} className="text-gray-400" />
          <span className="text-sm text-gray-400">{t.selectFile} (.xlsx)</span>
          <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
        </label>

        {error && (
          <div className="p-2 mb-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs">{error}</div>
        )}

        {/* Preview table */}
        {accounts.length > 0 && !done && (
          <>
            <p className="text-xs text-gray-400 mb-2">{t.preview}: {accounts.length} {t.accounts}</p>
            <div className="overflow-auto max-h-60 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left p-1.5">{t.name}</th>
                    <th className="text-right p-1.5">Balance</th>
                    <th className="text-right p-1.5">{t.entries}</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc, i) => {
                    const netBalance = acc.totalReceived - acc.totalPayment;
                    const balanceClass = netBalance >= 0 ? 'text-emerald-400' : 'text-red-400';
                    const balanceText = `${netBalance >= 0 ? '+' : ''}₹${Math.abs(netBalance).toLocaleString('en-IN')}`;
                    return (
                      <tr key={i} className="border-b border-gray-700/50">
                        <td className="p-1.5 font-medium">{acc.name}</td>
                        <td className={`p-1.5 text-right font-semibold ${balanceClass}`}>
                          {balanceText}
                        </td>
                        <td className="p-1.5 text-right text-gray-400">{acc.entries.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded font-medium text-sm flex items-center justify-center gap-2"
            >
              {importing ? t.importing : <><Upload size={14} /> {t.importBtn}</>}
            </button>
          </>
        )}

        {/* Success */}
        {done && (
          <div className="p-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-3">
              <Check size={24} className="text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-medium">{t.importSuccess}</p>
          </div>
        )}
      </div>
    </div>
  );
}
