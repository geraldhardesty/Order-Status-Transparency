import type { OrderFilters, OrderStatus } from '../types/order';
import { SearchIcon } from './icons';

const ALL_STATUSES: OrderStatus[] = ['Open', 'In Production', 'Ready to Ship', 'Delayed', 'Shipped', 'Cancelled'];

const DEFAULT_FILTERS: OrderFilters = {
  search: '',
  statuses: [],
  reps: [],
  creditHoldOnly: false,
  expeditedOnly: false,
  atRiskOnly: false,
  sources: [],
};

export { DEFAULT_FILTERS };

interface Props {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
  repOptions: string[];
  resultCount: number;
}

export function FilterToolbar({ filters, onChange, repOptions, resultCount }: Props) {
  function toggleStatus(status: OrderStatus) {
    const has = filters.statuses.includes(status);
    onChange({
      ...filters,
      statuses: has ? filters.statuses.filter((s) => s !== status) : [...filters.statuses, status],
    });
  }

  function toggleSource(source: 'SAP' | 'Excel') {
    const has = filters.sources.includes(source);
    onChange({
      ...filters,
      sources: has ? filters.sources.filter((s) => s !== source) : [...filters.sources, source],
    });
  }

  const isDefault =
    !filters.search &&
    filters.statuses.length === 0 &&
    filters.reps.length === 0 &&
    filters.sources.length === 0 &&
    !filters.creditHoldOnly &&
    !filters.expeditedOnly &&
    !filters.atRiskOnly;

  return (
    <div className="filter-bar">
      <div className="filter-search">
        <span className="filter-search__icon">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search sales order, linkage #, or customer…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Status</span>
        <div className="chip-set">
          {ALL_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className="chip"
              aria-pressed={filters.statuses.includes(status)}
              onClick={() => toggleStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Source</span>
        <div className="chip-set">
          {(['SAP', 'Excel'] as const).map((source) => (
            <button
              key={source}
              type="button"
              className="chip"
              aria-pressed={filters.sources.includes(source)}
              onClick={() => toggleSource(source)}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Rep</span>
        <select
          className="filter-select"
          value={filters.reps[0] ?? ''}
          onChange={(e) => onChange({ ...filters, reps: e.target.value ? [e.target.value] : [] })}
        >
          <option value="">All reps</option>
          {repOptions.map((rep) => (
            <option key={rep} value={rep}>
              {rep}
            </option>
          ))}
        </select>
      </div>

      <label className="filter-checkbox">
        <input
          type="checkbox"
          checked={filters.creditHoldOnly}
          onChange={(e) => onChange({ ...filters, creditHoldOnly: e.target.checked })}
        />
        Credit hold only
      </label>

      <label className="filter-checkbox">
        <input
          type="checkbox"
          checked={filters.atRiskOnly}
          onChange={(e) => onChange({ ...filters, atRiskOnly: e.target.checked })}
        />
        At risk only
      </label>

      <label className="filter-checkbox">
        <input
          type="checkbox"
          checked={filters.expeditedOnly}
          onChange={(e) => onChange({ ...filters, expeditedOnly: e.target.checked })}
        />
        Expedited only
      </label>

      <span className="cell-muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
        {resultCount} order{resultCount === 1 ? '' : 's'}
      </span>

      {!isDefault && (
        <button type="button" className="btn btn-sm" onClick={() => onChange(DEFAULT_FILTERS)}>
          Clear filters
        </button>
      )}
    </div>
  );
}
