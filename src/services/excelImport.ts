import type { Order, OrderStatus } from '../types/order';

// Expected column headers in the uploaded workbook (first row), matched case-insensitively
// and with punctuation/whitespace ignored. This mirrors the dashboard's column set so a
// planner's tracking sheet can be dropped in with minimal reformatting.
const HEADER_ALIASES: Record<string, string> = {
  salesordernumber: 'salesOrderNumber',
  soNumber: 'salesOrderNumber',
  linkagenumber: 'linkageNumber',
  linkage: 'linkageNumber',
  customername: 'customerName',
  customerid: 'customerId',
  rep: 'rep',
  salesrep: 'rep',
  mscode: 'msCode',
  status: 'status',
  originalpromisedshippingdate: 'originalPromisedShipDate',
  originalpromisedshipdate: 'originalPromisedShipDate',
  plannedshippingdate: 'plannedShippingDate',
  plannedshipdate: 'plannedShippingDate',
  credithold: 'creditHold',
};

const VALID_STATUSES: OrderStatus[] = [
  'Open',
  'In Production',
  'Ready to Ship',
  'Shipped',
  'Delayed',
  'Cancelled',
];

function normalizeHeader(raw: string): string | null {
  const key = raw.toLowerCase().replace(/[^a-z]/g, '');
  return HEADER_ALIASES[key] ?? null;
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  return '';
}

function toCreditHold(value: unknown): boolean {
  const s = String(value ?? '').trim().toLowerCase();
  return s === 'yes' || s === 'y' || s === 'true' || s === '1';
}

function toStatus(value: unknown): OrderStatus {
  const s = String(value ?? '').trim();
  const match = VALID_STATUSES.find((v) => v.toLowerCase() === s.toLowerCase());
  return match ?? 'Open';
}

export interface ExcelImportResult {
  orders: Order[];
  skippedRows: number;
  missingColumns: string[];
}

export async function parseOrdersFromExcel(file: File): Promise<ExcelImportResult> {
  const { Workbook } = await import('exceljs');
  const buffer = await file.arrayBuffer();
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { orders: [], skippedRows: 0, missingColumns: [] };
  }

  const headerRow = sheet.getRow(1);
  const columnMap: Record<number, string> = {};
  headerRow.eachCell((cell, colNumber) => {
    const mapped = normalizeHeader(String(cell.value ?? ''));
    if (mapped) columnMap[colNumber] = mapped;
  });

  const requiredFields = ['salesOrderNumber', 'customerName', 'status'];
  const foundFields = new Set(Object.values(columnMap));
  const missingColumns = requiredFields.filter((f) => !foundFields.has(f));
  if (missingColumns.length > 0) {
    return { orders: [], skippedRows: 0, missingColumns };
  }

  const orders: Order[] = [];
  let skippedRows = 0;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, unknown> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const field = columnMap[colNumber];
      if (field) record[field] = cell.value;
    });

    const salesOrderNumber = String(record.salesOrderNumber ?? '').trim();
    const customerName = String(record.customerName ?? '').trim();
    if (!salesOrderNumber || !customerName) {
      skippedRows += 1;
      return;
    }

    orders.push({
      salesOrderNumber,
      linkageNumber: String(record.linkageNumber ?? '').trim(),
      customerName,
      customerId: String(record.customerId ?? '').trim(),
      rep: String(record.rep ?? '').trim(),
      msCode: String(record.msCode ?? '').trim(),
      status: toStatus(record.status),
      originalPromisedShipDate: toIsoDate(record.originalPromisedShipDate),
      plannedShippingDate: toIsoDate(record.plannedShippingDate),
      creditHold: toCreditHold(record.creditHold),
      source: 'Excel',
      expedited: false,
      actionHistory: [],
    });
  });

  return { orders, skippedRows, missingColumns: [] };
}
