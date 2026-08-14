import { useMemo } from 'react';
import type { Order } from '../types/order';
import { daysFromToday, scheduleVarianceDays } from '../utils/dates';

const OPEN_STATUSES = new Set(['Open', 'In Production', 'Ready to Ship', 'Delayed']);

export function KpiBar({ orders }: { orders: Order[] }) {
  const stats = useMemo(() => {
    const today = new Date();
    const openOrders = orders.filter((o) => OPEN_STATUSES.has(o.status));
    const creditHold = orders.filter((o) => o.creditHold && OPEN_STATUSES.has(o.status));
    const atRisk = openOrders.filter((o) => scheduleVarianceDays(o.originalPromisedShipDate, o.plannedShippingDate) > 0);
    const expedited = orders.filter((o) => o.expedited && OPEN_STATUSES.has(o.status));
    const shippingThisWeek = openOrders.filter((o) => {
      const d = daysFromToday(o.plannedShippingDate, today);
      return d >= 0 && d <= 7;
    });

    return {
      openCount: openOrders.length,
      creditHoldCount: creditHold.length,
      atRiskCount: atRisk.length,
      expeditedCount: expedited.length,
      shippingThisWeekCount: shippingThisWeek.length,
    };
  }, [orders]);

  return (
    <div className="kpi-row">
      <div className="kpi-tile">
        <p className="kpi-tile__label">Open Orders</p>
        <div className="kpi-tile__value">{stats.openCount}</div>
        <p className="kpi-tile__meta">Not yet shipped or cancelled</p>
      </div>
      <div className="kpi-tile kpi-tile--accent-red">
        <p className="kpi-tile__label">On Credit Hold</p>
        <div className="kpi-tile__value">{stats.creditHoldCount}</div>
        <p className="kpi-tile__meta">Blocking release to production/shipping</p>
      </div>
      <div className="kpi-tile kpi-tile--accent-amber">
        <p className="kpi-tile__label">At Risk</p>
        <div className="kpi-tile__value">{stats.atRiskCount}</div>
        <p className="kpi-tile__meta">Planned date has slipped vs. promise</p>
      </div>
      <div className="kpi-tile kpi-tile--accent-yellow">
        <p className="kpi-tile__label">Expedited</p>
        <div className="kpi-tile__value">{stats.expeditedCount}</div>
        <p className="kpi-tile__meta">Active expedite requests</p>
      </div>
      <div className="kpi-tile kpi-tile--accent-blue">
        <p className="kpi-tile__label">Shipping in 7 Days</p>
        <div className="kpi-tile__value">{stats.shippingThisWeekCount}</div>
        <p className="kpi-tile__meta">By current planned ship date</p>
      </div>
    </div>
  );
}
