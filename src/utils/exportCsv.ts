import type { Order } from '../types/order';

const COLUMNS: Array<{ header: string; get: (o: Order) => string }> = [
  { header: 'Sales Order Number', get: (o) => o.salesOrderNumber },
  { header: 'Linkage Number', get: (o) => o.linkageNumber },
  { header: 'Customer Name', get: (o) => o.customerName },
  { header: 'Customer ID', get: (o) => o.customerId },
  { header: 'Rep', get: (o) => o.rep },
  { header: 'MS Code', get: (o) => o.msCode },
  { header: 'Status', get: (o) => o.status },
  { header: 'Original Promised Shipping Date', get: (o) => o.originalPromisedShipDate },
  { header: 'Planned Shipping Date', get: (o) => o.plannedShippingDate },
  { header: 'Credit Hold', get: (o) => (o.creditHold ? 'Yes' : 'No') },
  { header: 'Source', get: (o) => o.source },
  { header: 'Expedited', get: (o) => (o.expedited ? 'Yes' : 'No') },
];

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function ordersToCsv(orders: Order[]): string {
  const header = COLUMNS.map((c) => csvEscape(c.header)).join(',');
  const rows = orders.map((o) => COLUMNS.map((c) => csvEscape(c.get(o))).join(','));
  return [header, ...rows].join('\r\n');
}

export function downloadCsv(orders: Order[], fileName: string): void {
  const csv = ordersToCsv(orders);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
