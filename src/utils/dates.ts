const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function scheduleVarianceDays(originalIso: string, plannedIso: string): number {
  const original = parseIsoDate(originalIso);
  const planned = parseIsoDate(plannedIso);
  if (!original || !planned) return 0;
  return Math.round((planned.getTime() - original.getTime()) / MS_PER_DAY);
}

export function formatDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function daysFromToday(iso: string, today: Date): number {
  const d = parseIsoDate(iso);
  if (!d) return NaN;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((d.getTime() - start.getTime()) / MS_PER_DAY);
}
