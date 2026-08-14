import { useRef, useState } from 'react';
import { parseOrdersFromExcel } from '../services/excelImport';
import type { Order } from '../types/order';
import { UploadIcon } from './icons';

interface Props {
  onImported: (orders: Order[], fileName: string) => void;
  onError: (message: string) => void;
}

export function ImportExcelButton({ onImported, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const result = await parseOrdersFromExcel(file);
      if (result.missingColumns.length > 0) {
        onError(
          `Import failed — the sheet is missing required column(s): ${result.missingColumns.join(', ')}. ` +
            'Expected headers include Sales Order Number, Customer Name, Status (plus the other dashboard columns).',
        );
        return;
      }
      if (result.orders.length === 0) {
        onError('No usable rows were found in that file.');
        return;
      }
      onImported(result.orders, file.name);
    } catch {
      onError('Could not read that file. Please upload a .xlsx workbook exported from Excel.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="btn" disabled={busy} onClick={() => inputRef.current?.click()}>
        <UploadIcon />
        {busy ? 'Importing…' : 'Import Excel'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        className="visually-hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void handleFile(file);
        }}
      />
    </>
  );
}
