import { useState } from 'react';
import type { Order } from '../types/order';
import { formatDate, scheduleVarianceDays } from '../utils/dates';
import { CreditHoldBadge, SourceTag, StatusBadge } from './Badges';
import { BoltIcon, ChevronIcon } from './icons';

const TERMINAL_STATUSES = new Set(['Shipped', 'Cancelled']);

interface Props {
  order: Order;
  expanded: boolean;
  onToggleExpand: () => void;
  onExpedite: () => void;
  onReleaseHold: () => void;
  onAddNote: (note: string) => void;
}

export function OrderRow({ order, expanded, onToggleExpand, onExpedite, onReleaseHold, onAddNote }: Props) {
  const [noteDraft, setNoteDraft] = useState('');
  const variance = scheduleVarianceDays(order.originalPromisedShipDate, order.plannedShippingDate);
  const isTerminal = TERMINAL_STATUSES.has(order.status);
  const isAtRisk = !isTerminal && variance > 0;

  const rowClassNames = [
    order.creditHold && !isTerminal ? 'row--credit-hold' : '',
    isAtRisk ? 'row--at-risk' : '',
    expanded ? 'row--expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  function submitNote() {
    const trimmed = noteDraft.trim();
    if (!trimmed) return;
    onAddNote(trimmed);
    setNoteDraft('');
  }

  return (
    <>
      <tr className={rowClassNames}>
        <td>
          <button className="expand-toggle" onClick={onToggleExpand} aria-label={expanded ? 'Collapse details' : 'Expand details'}>
            <ChevronIcon direction={expanded ? 'down' : 'right'} />
          </button>
        </td>
        <td className="cell-mono">{order.salesOrderNumber}</td>
        <td className="cell-mono cell-muted">{order.linkageNumber || '—'}</td>
        <td className="cell-wrap">{order.customerName}</td>
        <td className="cell-mono cell-muted">{order.customerId || '—'}</td>
        <td>{order.rep || '—'}</td>
        <td className="cell-mono">{order.msCode || '—'}</td>
        <td>
          <StatusBadge status={order.status} />
        </td>
        <td className="cell-muted">{formatDate(order.originalPromisedShipDate)}</td>
        <td>
          <div className="schedule-cell">
            <span>{formatDate(order.plannedShippingDate)}</span>
            {variance > 0 && <span className="schedule-cell__variance schedule-cell__variance--slip">+{variance}d slip</span>}
            {variance <= 0 && !isTerminal && <span className="schedule-cell__variance schedule-cell__variance--onplan">on plan</span>}
          </div>
        </td>
        <td>
          <CreditHoldBadge onHold={order.creditHold} />
        </td>
        <td>
          <SourceTag source={order.source} />
        </td>
        <td>
          <div className="cell-actions">
            {order.creditHold && (
              <button type="button" className="btn btn-sm" onClick={onReleaseHold}>
                Release
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={order.expedited || isTerminal}
              onClick={onExpedite}
              title={order.expedited ? 'Expedite already requested' : undefined}
            >
              <BoltIcon />
              {order.expedited ? 'Expedited' : 'Expedite'}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="detail-row">
          <td colSpan={13}>
            <div className="detail-panel">
              <div className="detail-panel__facts">
                <h4 style={{ gridColumn: '1 / -1' }}>Order Detail</h4>
                <Fact label="Sales Order #" value={order.salesOrderNumber} />
                <Fact label="Linkage #" value={order.linkageNumber || '—'} />
                <Fact label="Customer" value={`${order.customerName} (${order.customerId || '—'})`} />
                <Fact label="Rep" value={order.rep || '—'} />
                <Fact label="MS Code" value={order.msCode || '—'} />
                <Fact label="Source" value={order.source} />
                <Fact label="Original Promised Ship" value={formatDate(order.originalPromisedShipDate)} />
                <Fact label="Planned Ship" value={formatDate(order.plannedShippingDate)} />
                <Fact label="Schedule Variance" value={variance === 0 ? 'On plan' : `${variance > 0 ? '+' : ''}${variance} days`} />
                <Fact label="Credit Hold" value={order.creditHold ? 'Yes' : 'No'} />
              </div>
              <div className="detail-panel__history">
                <h4>Action History</h4>
                {order.actionHistory.length === 0 ? (
                  <p className="history-empty">No actions logged yet for this order.</p>
                ) : (
                  <ul className="history-list">
                    {[...order.actionHistory].reverse().map((entry) => (
                      <li className="history-item" key={entry.id}>
                        <div>
                          <strong>{entry.type}</strong>
                          {entry.reason ? ` — ${entry.reason}` : ''}
                        </div>
                        {entry.note && <div>{entry.note}</div>}
                        <div className="history-item__meta">
                          {entry.actor} · {new Date(entry.timestampIso).toLocaleString('en-US')}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="note-form">
                  <input
                    type="text"
                    placeholder="Add a note to this order's history…"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitNote()}
                  />
                  <button type="button" className="btn btn-sm" onClick={submitNote}>
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
