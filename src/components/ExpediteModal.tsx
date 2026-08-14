import { useState } from 'react';
import type { Order } from '../types/order';
import { Modal } from './Modal';

const REASONS = ['Customer Request', 'Production Priority', 'Executive Escalation', 'Line-Down / Critical Spare', 'Other'];

interface Props {
  order: Order;
  onConfirm: (reason: string, note: string) => void;
  onCancel: () => void;
}

export function ExpediteModal({ order, onConfirm, onCancel }: Props) {
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');

  return (
    <Modal
      title={`Expedite ${order.salesOrderNumber}`}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onConfirm(reason, note)}>
            Submit Expedite Request
          </button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-700)' }}>
        {order.customerName} · {order.msCode} · Currently planned {order.plannedShippingDate || '—'}
      </p>
      <div className="field">
        <label htmlFor="expedite-reason">Reason</label>
        <select id="expedite-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="expedite-note">Notes for scheduling / production</label>
        <textarea
          id="expedite-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add context that will help scheduling prioritize this order…"
        />
      </div>
    </Modal>
  );
}
