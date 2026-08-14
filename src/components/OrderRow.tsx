import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Order } from '../types/order';
import { formatDate, scheduleVarianceDays } from '../utils/dates';
import { CreditHoldBadge, SourceTag, StatusBadge } from './Badges';
import { ExpediteModal } from './ExpediteModal';
import { AskQuestionModal } from './AskQuestionModal';
import { BoltIcon, ChevronIcon } from './icons';

const TERMINAL_STATUSES = new Set(['Shipped', 'Cancelled']);

interface Props {
  order: Order;
  expanded: boolean;
  onToggleExpand: () => void;
  onExpedite: (reason: string, note: string) => void;
  onAddNote: (note: string) => void;
  onAskQuestion: (question: string) => void;
}

export function OrderRow({ order, expanded, onToggleExpand, onExpedite, onAddNote, onAskQuestion }: Props) {
  const [noteDraft, setNoteDraft] = useState('');
  const [openModal, setOpenModal] = useState<'expedite' | 'question' | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const actionButtonRef = useRef<HTMLButtonElement>(null);
  const variance = scheduleVarianceDays(order.originalPromisedShipDate, order.plannedShippingDate);
  const isTerminal = TERMINAL_STATUSES.has(order.status);
  const isAtRisk = !isTerminal && variance > 0;

  function toggleActionMenu() {
    if (!showActionMenu && actionButtonRef.current) {
      const rect = actionButtonRef.current.getBoundingClientRect();
      const menuWidth = 190;
      setMenuPos({
        top: rect.bottom + 4,
        left: Math.min(rect.left, window.innerWidth - menuWidth - 8),
      });
    }
    setShowActionMenu((prev) => !prev);
  }

  useEffect(() => {
    if (!showActionMenu) return;
    const handleClickOutside = () => setShowActionMenu(false);
    const handleScroll = () => setShowActionMenu(false);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showActionMenu]);

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
        <td className="cell-mono col-sticky col-sticky-so">{order.salesOrderNumber}</td>
        <td className="cell-mono cell-muted">{order.linkageNumber || '—'}</td>
        <td className="cell-wrap col-sticky col-sticky-customer">{order.customerName}</td>
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
          {order.shippingNumber && order.shippingCarrier ? (
            <a
              href={getTrackingUrl(order.shippingNumber, order.shippingCarrier)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--brand-blue)', textDecoration: 'none', fontWeight: 500 }}
            >
              {order.shippingNumber}
            </a>
          ) : (
            '—'
          )}
        </td>
        <td className="cell-mono">{order.cpqQuoteNumber || '—'}</td>
        <td>
          <CreditHoldBadge onHold={order.creditHold} />
        </td>
        <td>
          <SourceTag source={order.source} />
        </td>
        <td>
          <div className="cell-actions" style={{ position: 'relative' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                ref={actionButtonRef}
                type="button"
                className="btn btn-sm btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleActionMenu();
                }}
                title="Actions menu"
              >
                Actions ▼
              </button>
              {showActionMenu &&
                createPortal(
                  <div
                    className="action-menu"
                    style={{ top: menuPos.top, left: menuPos.left }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="action-menu__item"
                      onClick={() => {
                        setOpenModal('expedite');
                        setShowActionMenu(false);
                      }}
                      disabled={order.expedited || isTerminal}
                    >
                      <BoltIcon /> Expedite
                    </button>
                    <button
                      type="button"
                      className="action-menu__item"
                      onClick={() => {
                        setOpenModal('question');
                        setShowActionMenu(false);
                      }}
                    >
                      Ask a Question
                    </button>
                  </div>,
                  document.body,
                )}
            </div>
          </div>
        </td>
      </tr>
      {openModal === 'expedite' && (
        <ExpediteModal
          order={order}
          onConfirm={(reason, note) => {
            onExpedite(reason, note);
            setOpenModal(null);
          }}
          onCancel={() => setOpenModal(null)}
        />
      )}
      {openModal === 'question' && (
        <AskQuestionModal
          order={order}
          onConfirm={(question) => {
            onAskQuestion(question);
            setOpenModal(null);
          }}
          onCancel={() => setOpenModal(null)}
        />
      )}
      {expanded && (
        <tr className="detail-row">
          <td colSpan={15}>
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
                <Fact label="CPQ Quote #" value={order.cpqQuoteNumber || '—'} />
                <Fact label="Shipping Number" value={order.shippingNumber ? `${order.shippingNumber} (${order.shippingCarrier})` : '—'} />
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

function getTrackingUrl(shippingNumber: string, carrier: 'FedEx' | 'UPS'): string {
  if (carrier === 'FedEx') {
    return `https://tracking.fedex.com/en/tracking/${shippingNumber}`;
  } else {
    return `https://www.ups.com/track?tracknum=${shippingNumber}`;
  }
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
