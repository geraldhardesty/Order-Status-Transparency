import type { OrderSource, OrderStatus } from '../types/order';

const STATUS_STYLE: Record<OrderStatus, { bg: string; fg: string }> = {
  Open: { bg: 'var(--status-open-bg)', fg: 'var(--status-open-fg)' },
  'In Production': { bg: 'var(--status-production-bg)', fg: 'var(--status-production-fg)' },
  'Ready to Ship': { bg: 'var(--status-ready-bg)', fg: 'var(--status-ready-fg)' },
  Shipped: { bg: 'var(--status-shipped-bg)', fg: 'var(--status-shipped-fg)' },
  Delayed: { bg: 'var(--status-delayed-bg)', fg: 'var(--status-delayed-fg)' },
  Cancelled: { bg: 'var(--status-cancelled-bg)', fg: 'var(--status-cancelled-fg)' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span className="badge" style={{ background: style.bg, color: style.fg }}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

export function CreditHoldBadge({ onHold }: { onHold: boolean }) {
  if (!onHold) {
    return <span style={{ color: 'var(--ink-500)' }}>No</span>;
  }
  return (
    <span className="badge" style={{ background: 'var(--credit-hold-bg)', color: 'var(--credit-hold-fg)' }}>
      <span className="badge-dot" />
      Yes
    </span>
  );
}

export function SourceTag({ source }: { source: OrderSource }) {
  const style =
    source === 'SAP'
      ? { bg: 'var(--sap-tag-bg)', fg: 'var(--sap-tag-fg)' }
      : { bg: 'var(--excel-tag-bg)', fg: 'var(--excel-tag-fg)' };
  return (
    <span className="badge-source" style={{ background: style.bg, color: style.fg }}>
      {source}
    </span>
  );
}
