import { useMemo, useState } from 'react';
import type { Order, SortKey, SortState } from '../types/order';
import { scheduleVarianceDays } from '../utils/dates';
import { OrderRow } from './OrderRow';
import { ChevronIcon } from './icons';

interface Column {
  key: SortKey | null;
  label: string;
  align?: 'right';
  sticky?: 'so' | 'customer';
}

const COLUMNS: Column[] = [
  { key: null, label: '' },
  { key: 'salesOrderNumber', label: 'Sales Order #', sticky: 'so' },
  { key: 'linkageNumber', label: 'Linkage #' },
  { key: 'customerName', label: 'Customer', sticky: 'customer' },
  { key: null, label: 'Customer ID' },
  { key: 'rep', label: 'Rep' },
  { key: null, label: 'MS Code' },
  { key: 'status', label: 'Status' },
  { key: 'originalPromisedShipDate', label: 'Orig. Promised Ship' },
  { key: 'plannedShippingDate', label: 'Planned Ship' },
  { key: null, label: 'Shipping #' },
  { key: null, label: 'CPQ Quote #' },
  { key: null, label: 'Credit Hold' },
  { key: null, label: 'Source' },
  { key: null, label: 'Actions', align: 'right' },
];

function compareOrders(a: Order, b: Order, sort: SortState): number {
  let av: string | number = '';
  let bv: string | number = '';
  if (sort.key === 'scheduleVarianceDays') {
    av = scheduleVarianceDays(a.originalPromisedShipDate, a.plannedShippingDate);
    bv = scheduleVarianceDays(b.originalPromisedShipDate, b.plannedShippingDate);
  } else {
    av = a[sort.key] ?? '';
    bv = b[sort.key] ?? '';
  }
  const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
  return sort.direction === 'asc' ? result : -result;
}

interface Props {
  orders: Order[];
  onExpedite: (order: Order, reason: string, note: string) => void;
  onAddNote: (order: Order, note: string) => void;
  onAskQuestion: (order: Order, question: string) => void;
}

export function OrdersTable({ orders, onExpedite, onAddNote, onAskQuestion }: Props) {
  const [sort, setSort] = useState<SortState>({ key: 'plannedShippingDate', direction: 'asc' });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => [...orders].sort((a, b) => compareOrders(a, b, sort)), [orders, sort]);

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' },
    );
  }

  function toggleExpand(soNumber: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(soNumber)) next.delete(soNumber);
      else next.add(soNumber);
      return next;
    });
  }

  return (
    <div className="table-card">
      <table className="orders-table">
        <colgroup>
          <col style={{ width: 28 }} />
          <col style={{ width: 118 }} />
          <col style={{ width: 88 }} />
          <col style={{ width: 180 }} />
          <col style={{ width: 92 }} />
          <col style={{ width: 82 }} />
          <col style={{ width: 96 }} />
          <col style={{ width: 108 }} />
          <col style={{ width: 108 }} />
          <col style={{ width: 108 }} />
          <col style={{ width: 128 }} />
          <col style={{ width: 115 }} />
          <col style={{ width: 98 }} />
          <col style={{ width: 68 }} />
          <col style={{ width: 158 }} />
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.label || 'expand'}
                className={col.sticky ? `col-sticky col-sticky-${col.sticky}` : undefined}
                style={col.align === 'right' ? { textAlign: 'right' } : undefined}
              >
                {col.key ? (
                  <button type="button" onClick={() => toggleSort(col.key!)}>
                    {col.label}
                    {sort.key === col.key && <ChevronIcon direction="down" className={sort.direction === 'asc' ? 'sort-asc' : undefined} />}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={COLUMNS.length} className="table-empty">
                No orders match the current filters.
              </td>
            </tr>
          )}
          {sorted.map((order) => (
            <OrderRow
              key={order.salesOrderNumber}
              order={order}
              expanded={expandedIds.has(order.salesOrderNumber)}
              onToggleExpand={() => toggleExpand(order.salesOrderNumber)}
              onExpedite={(reason, note) => onExpedite(order, reason, note)}
              onAddNote={(note) => onAddNote(order, note)}
              onAskQuestion={(question) => onAskQuestion(order, question)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
