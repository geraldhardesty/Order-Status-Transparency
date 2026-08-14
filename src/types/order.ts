export type OrderStatus =
  | 'Open'
  | 'In Production'
  | 'Ready to Ship'
  | 'Shipped'
  | 'Delayed'
  | 'Cancelled';

export type OrderSource = 'SAP' | 'Excel';

export type ActionType =
  | 'Expedite Requested'
  | 'Credit Hold Released'
  | 'Note Added'
  | 'Date Confirmed'
  | 'Question Asked';

export interface ActionLogEntry {
  id: string;
  type: ActionType;
  reason?: string;
  note?: string;
  actor: string;
  timestampIso: string;
}

export interface Order {
  salesOrderNumber: string;
  linkageNumber: string;
  customerName: string;
  customerId: string;
  rep: string;
  msCode: string;
  status: OrderStatus;
  originalPromisedShipDate: string; // ISO date
  plannedShippingDate: string; // ISO date
  creditHold: boolean;
  source: OrderSource;
  expedited: boolean;
  shippingNumber?: string;
  shippingCarrier?: 'FedEx' | 'UPS';
  cpqQuoteNumber?: string;
  actionHistory: ActionLogEntry[];
}

export interface OrderFilters {
  search: string;
  statuses: OrderStatus[];
  reps: string[];
  creditHoldOnly: boolean;
  expeditedOnly: boolean;
  atRiskOnly: boolean;
  sources: OrderSource[];
}

export type SortKey =
  | 'salesOrderNumber'
  | 'linkageNumber'
  | 'customerName'
  | 'rep'
  | 'status'
  | 'originalPromisedShipDate'
  | 'plannedShippingDate'
  | 'scheduleVarianceDays';

export interface SortState {
  key: SortKey;
  direction: 'asc' | 'desc';
}
