import { useState } from 'react';
import type { Order } from '../types/order';
import { Modal } from './Modal';

interface Props {
  order: Order;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export function ReleaseHoldModal({ order, onConfirm, onCancel }: Props) {
  const [note, setNote] = useState('');

  return (
    <Modal
      title={`Release Credit Hold — ${order.salesOrderNumber}`}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onConfirm(note)}>
            Release Hold
          </button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-700)' }}>
        This records the release in the dashboard's action log. Confirm the actual credit release with Finance/Credit
        Management in SAP as well.
      </p>
      <div className="field">
        <label htmlFor="release-note">Approval reference / note</label>
        <textarea
          id="release-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Approved by Finance — payment received 8/13"
        />
      </div>
    </Modal>
  );
}
