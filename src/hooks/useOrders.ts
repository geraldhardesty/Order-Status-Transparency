import { useCallback, useMemo, useReducer } from 'react';
import { mockOrders } from '../data/mockOrders';
import type { ActionLogEntry, ActionType, Order } from '../types/order';

interface State {
  orders: Order[];
  lastImport: { fileName: string; addedCount: number; updatedCount: number } | null;
}

type Action =
  | { type: 'IMPORT_EXCEL'; orders: Order[]; fileName: string }
  | { type: 'LOG_ACTION'; salesOrderNumber: string; entry: ActionLogEntry; patch?: Partial<Order> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'IMPORT_EXCEL': {
      const bySo = new Map(state.orders.map((o) => [o.salesOrderNumber, o]));
      let addedCount = 0;
      let updatedCount = 0;
      for (const incoming of action.orders) {
        if (bySo.has(incoming.salesOrderNumber)) {
          const existing = bySo.get(incoming.salesOrderNumber)!;
          bySo.set(incoming.salesOrderNumber, {
            ...incoming,
            expedited: existing.expedited,
            actionHistory: existing.actionHistory,
          });
          updatedCount += 1;
        } else {
          bySo.set(incoming.salesOrderNumber, incoming);
          addedCount += 1;
        }
      }
      return {
        orders: Array.from(bySo.values()),
        lastImport: { fileName: action.fileName, addedCount, updatedCount },
      };
    }
    case 'LOG_ACTION': {
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.salesOrderNumber === action.salesOrderNumber
            ? { ...o, ...action.patch, actionHistory: [...o.actionHistory, action.entry] }
            : o,
        ),
      };
    }
    default:
      return state;
  }
}

let actionIdCounter = 0;
function nextActionId(): string {
  actionIdCounter += 1;
  return `action-${actionIdCounter}`;
}

export function useOrders() {
  const [state, dispatch] = useReducer(reducer, { orders: mockOrders, lastImport: null });

  const importExcel = useCallback((orders: Order[], fileName: string) => {
    dispatch({ type: 'IMPORT_EXCEL', orders, fileName });
  }, []);

  const expediteOrder = useCallback((salesOrderNumber: string, reason: string, note: string, actor: string) => {
    dispatch({
      type: 'LOG_ACTION',
      salesOrderNumber,
      patch: { expedited: true },
      entry: {
        id: nextActionId(),
        type: 'Expedite Requested' as ActionType,
        reason,
        note,
        actor,
        timestampIso: new Date().toISOString(),
      },
    });
  }, []);

  const releaseCreditHold = useCallback((salesOrderNumber: string, note: string, actor: string) => {
    dispatch({
      type: 'LOG_ACTION',
      salesOrderNumber,
      patch: { creditHold: false },
      entry: {
        id: nextActionId(),
        type: 'Credit Hold Released' as ActionType,
        note,
        actor,
        timestampIso: new Date().toISOString(),
      },
    });
  }, []);

  const addNote = useCallback((salesOrderNumber: string, note: string, actor: string) => {
    dispatch({
      type: 'LOG_ACTION',
      salesOrderNumber,
      entry: {
        id: nextActionId(),
        type: 'Note Added' as ActionType,
        note,
        actor,
        timestampIso: new Date().toISOString(),
      },
    });
  }, []);

  return useMemo(
    () => ({
      orders: state.orders,
      lastImport: state.lastImport,
      importExcel,
      expediteOrder,
      releaseCreditHold,
      addNote,
    }),
    [state.orders, state.lastImport, importExcel, expediteOrder, releaseCreditHold, addNote],
  );
}
