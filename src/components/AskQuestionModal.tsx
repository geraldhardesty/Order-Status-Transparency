import { useState } from 'react';
import type { Order } from '../types/order';
import { Modal } from './Modal';

interface Props {
  order: Order;
  onConfirm: (question: string) => void;
  onCancel: () => void;
}

export function AskQuestionModal({ order, onConfirm, onCancel }: Props) {
  const [question, setQuestion] = useState('');

  return (
    <Modal
      title={`Ask a Question - ${order.salesOrderNumber}`}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!question.trim()}
            onClick={() => onConfirm(question)}
          >
            Submit Question
          </button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-700)' }}>
        {order.customerName} · {order.msCode} · SO {order.salesOrderNumber}
      </p>
      <div className="field">
        <label htmlFor="question-text">Your Question</label>
        <textarea
          id="question-text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this order…"
          rows={4}
        />
      </div>
    </Modal>
  );
}
