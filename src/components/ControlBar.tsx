import { statusMeta, statusOptions } from '../constants/status';
import { TIME_RANGE_OPTIONS } from '../constants/timeline';
import type { StatusFilter } from '../types';

type ControlBarProps = {
  query: string;
  statusFilter: StatusFilter;
  rangeHours: number;
  isPaused: boolean;
  onQueryChange: (query: string) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onRangeHoursChange: (hours: number) => void;
  onPauseToggle: () => void;
};

function ControlBar({
  query,
  statusFilter,
  rangeHours,
  isPaused,
  onQueryChange,
  onStatusFilterChange,
  onRangeHoursChange,
  onPauseToggle,
}: ControlBarProps) {
  return (
    <div className="controls" aria-label="Timeline controls">
      <button className="primary-action" type="button">
        + Tournament
      </button>

      <label className="control-field">
        <span>Search</span>
        <input
          type="search"
          value={query}
          placeholder="Name or buy-in"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      <label className="control-field">
        <span>Status</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as StatusFilter)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All states' : statusMeta[status].label}
            </option>
          ))}
        </select>
      </label>

      <div className="range-toggle" aria-label="Visible time range">
        {TIME_RANGE_OPTIONS.map((hours) => (
          <button
            className={rangeHours === hours ? 'active' : ''}
            key={hours}
            type="button"
            onClick={() => onRangeHoursChange(hours)}
          >
            {hours}h
          </button>
        ))}
      </div>

      <button
        className="pause-button"
        type="button"
        aria-pressed={isPaused}
        onClick={onPauseToggle}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}

export default ControlBar;
