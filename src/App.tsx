import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { KpiBar } from './components/KpiBar';
import { FilterToolbar, DEFAULT_FILTERS } from './components/FilterToolbar';
import { OrdersTable } from './components/OrdersTable';
import { ImportExcelButton } from './components/ImportExcelButton';
import { ExpediteModal } from './components/ExpediteModal';
import { ReleaseHoldModal } from './components/ReleaseHoldModal';
import { Toast } from './components/Toast';
import { RefreshIcon, DownloadIcon } from './components/icons';
import { useOrders } from './hooks/useOrders';
import { downloadCsv } from './utils/exportCsv';
import { scheduleVarianceDays } from './utils/dates';
import type { Order, OrderFilters } from './types/order';

const CURRENT_USER = 'You';

function matchesFilters(order: Order, filters: OrderFilters): boolean {
  if (filters.creditHoldOnly && !order.creditHold) return false;
  if (filters.expeditedOnly && !order.expedited) return false;
  if (filters.atRiskOnly) {
    const variance = scheduleVarianceDays(order.originalPromisedShipDate, order.plannedShippingDate);
    if (variance <= 0) return false;
  }
  if (filters.statuses.length > 0 && !filters.statuses.includes(order.status)) return false;
  if (filters.reps.length > 0 && !filters.reps.includes(order.rep)) return false;
  if (filters.sources.length > 0 && !filters.sources.includes(order.source)) return false;
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    const haystack = `${order.salesOrderNumber} ${order.linkageNumber} ${order.customerName}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function App() {
  const { orders, lastImport, importExcel, expediteOrder, releaseCreditHold, addNote, askQuestion } = useOrders();
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [expediteTarget, setExpediteTarget] = useState<Order | null>(null);
  const [releaseHoldTarget, setReleaseHoldTarget] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredOrders = useMemo(() => orders.filter((o) => matchesFilters(o, filters)), [orders, filters]);
  const repOptions = useMemo(() => Array.from(new Set(orders.map((o) => o.rep).filter(Boolean))).sort(), [orders]);

  function handleImported(imported: Order[], fileName: string) {
    importExcel(imported, fileName);
    setToastMessage(`Imported ${imported.length} row(s) from ${fileName}.`);
  }

  function handleExpediteConfirm(reason: string, note: string) {
    if (!expediteTarget) return;
    expediteOrder(expediteTarget.salesOrderNumber, reason, note, CURRENT_USER);
    setToastMessage(`Expedite request logged for ${expediteTarget.salesOrderNumber}.`);
    setExpediteTarget(null);
  }

  function handleReleaseHoldConfirm(note: string) {
    if (!releaseHoldTarget) return;
    releaseCreditHold(releaseHoldTarget.salesOrderNumber, note, CURRENT_USER);
    setToastMessage(`Credit hold marked released for ${releaseHoldTarget.salesOrderNumber}.`);
    setReleaseHoldTarget(null);
  }

  return (
    <div className="app-shell">
      <Header />

      <div className="page-toolbar">
        <div className="page-toolbar__inner">
          <div>
            <h1 className="page-title">Order Status Transparency</h1>
            <p className="page-subtitle">
              PO entry through shipment · {orders.length} orders tracked
              {lastImport ? ` · last import: ${lastImport.fileName} (${lastImport.addedCount} added, ${lastImport.updatedCount} updated)` : ''}
            </p>
          </div>
          <div className="page-toolbar__actions">
            <ImportExcelButton onImported={handleImported} onError={setToastMessage} />
            <button type="button" className="btn" onClick={() => downloadCsv(filteredOrders, 'order-status-export.csv')}>
              <DownloadIcon />
              Export View
            </button>
            <button type="button" className="btn" onClick={() => setToastMessage('Refreshed from SAP (demo — no live connection configured).')}>
              <RefreshIcon />
              Refresh from SAP
            </button>
          </div>
        </div>
      </div>

      <main className="app-main">
        <KpiBar orders={orders} />
        <FilterToolbar filters={filters} onChange={setFilters} repOptions={repOptions} resultCount={filteredOrders.length} />
        <OrdersTable
          orders={filteredOrders}
          onExpedite={(order, reason, note) => {
            expediteOrder(order.salesOrderNumber, reason, note, CURRENT_USER);
            setToastMessage(`Expedite request logged for ${order.salesOrderNumber}.`);
          }}
          onAddNote={(order, note) => addNote(order.salesOrderNumber, note, CURRENT_USER)}
          onAskQuestion={(order, question) => {
            askQuestion(order.salesOrderNumber, question, CURRENT_USER);
            setToastMessage(`Question logged for ${order.salesOrderNumber}.`);
          }}
        />
      </main>

      {expediteTarget && (
        <ExpediteModal order={expediteTarget} onCancel={() => setExpediteTarget(null)} onConfirm={handleExpediteConfirm} />
      )}
      {releaseHoldTarget && (
        <ReleaseHoldModal order={releaseHoldTarget} onCancel={() => setReleaseHoldTarget(null)} onConfirm={handleReleaseHoldConfirm} />
      )}
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
}

export default App;
