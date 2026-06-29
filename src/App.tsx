import { useEffect, useMemo, useState } from 'react';
import tournamentsJson from './data/tournaments.json';
import type { TimelinePlacement, Tournament, TournamentStatus } from './types';

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const timeFormatter = new Intl.DateTimeFormat([], {
  hour: '2-digit',
  minute: '2-digit',
});

const statusMeta: Record<TournamentStatus, { label: string; tone: string }> = {
  scheduled: { label: 'Scheduled', tone: 'slate' },
  registering: { label: 'Registering', tone: 'green' },
  'closing-soon': { label: 'Closing Soon', tone: 'amber' },
  running: { label: 'Running', tone: 'blue' },
  'final-table': { label: 'Final Table', tone: 'red' },
  finished: { label: 'Finished', tone: 'muted' },
};

const statusOptions: Array<'all' | TournamentStatus> = [
  'all',
  'scheduled',
  'registering',
  'closing-soon',
  'running',
  'final-table',
  'finished',
];

function parseStartTime(startTime: string, baseline: number) {
  const relativeMatch = startTime.match(/^(-?\d+)m$/);

  if (relativeMatch) {
    return baseline + Number(relativeMatch[1]) * MINUTE_MS;
  }

  return new Date(startTime).getTime();
}

function getPlacement(
  tournament: Tournament,
  resolvedStart: number,
  currentTime: number,
  rangeHours: number,
): TimelinePlacement {
  const visibleRangeMs = rangeHours * HOUR_MS;
  const endTime = resolvedStart + tournament.durationMinutes * MINUTE_MS;
  const leftPercent = ((resolvedStart - currentTime) / visibleRangeMs) * 100;
  const widthPercent = ((endTime - resolvedStart) / visibleRangeMs) * 100;

  return {
    leftPercent,
    widthPercent,
    isVisible: endTime >= currentTime && resolvedStart <= currentTime + visibleRangeMs,
  };
}

function buildTimeMarks(currentTime: number, rangeHours: number) {
  const stepMinutes = rangeHours <= 3 ? 15 : rangeHours <= 6 ? 30 : 60;
  const stepMs = stepMinutes * MINUTE_MS;
  const totalMarks = Math.floor((rangeHours * HOUR_MS) / stepMs);

  return Array.from({ length: totalMarks + 1 }, (_, index) => {
    const value = currentTime + index * stepMs;

    return {
      label: index === 0 ? 'NOW' : timeFormatter.format(value),
      leftPercent: (index / totalMarks) * 100,
    };
  });
}

function App() {
  const baseline = useMemo(() => Date.now(), []);
  const tournaments = tournamentsJson as Tournament[];
  const [currentTime, setCurrentTime] = useState(baseline);
  const [rangeHours, setRangeHours] = useState(6);
  const [isPaused, setIsPaused] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TournamentStatus>('all');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const resolvedStarts = useMemo(
    () =>
      new Map(
        tournaments.map((tournament) => [
          tournament.id,
          parseStartTime(tournament.startTime, baseline),
        ]),
      ),
    [baseline, tournaments],
  );

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, MINUTE_MS);

    return () => window.clearInterval(intervalId);
  }, [isPaused]);

  const timeMarks = useMemo(
    () => buildTimeMarks(currentTime, rangeHours),
    [currentTime, rangeHours],
  );

  const filteredTournaments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tournaments.filter((tournament) => {
      const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        tournament.name.toLowerCase().includes(normalizedQuery) ||
        tournament.id.toLowerCase().includes(normalizedQuery) ||
        tournament.buyIn.toLowerCase().includes(normalizedQuery) ||
        tournament.stakes.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, tournaments]);

  return (
    <main className="app-shell">
      <section className="board">
        <header className="topbar">
          <div>
            <p className="eyebrow">Live Track</p>
            <h1>Poker Tournament Timeline</h1>
          </div>

          <div className="controls" aria-label="Timeline controls">
            <button className="primary-action" type="button">
              + Tournament
            </button>

            <label className="control-field">
              <span>Search</span>
              <input
                type="search"
                value={query}
                placeholder="Name, ID, buy-in"
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>

            <label className="control-field">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as 'all' | TournamentStatus)
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All states' : statusMeta[status].label}
                  </option>
                ))}
              </select>
            </label>

            <div className="range-toggle" aria-label="Visible time range">
              {[3, 6, 12].map((hours) => (
                <button
                  className={rangeHours === hours ? 'active' : ''}
                  key={hours}
                  type="button"
                  onClick={() => setRangeHours(hours)}
                >
                  {hours}h
                </button>
              ))}
            </div>

            <button
              className="pause-button"
              type="button"
              aria-pressed={isPaused}
              onClick={() => {
                if (isPaused) {
                  setCurrentTime(Date.now());
                }

                setIsPaused((value) => !value);
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </header>

        <section className="timeline-panel" aria-label="Tournament schedule timeline">
          <div className="now-line" aria-hidden="true">
            <span>NOW</span>
          </div>

          <div className="timeline-header">
            <div className="row-label header-label">
              <span>ID</span>
              <span>Stakes</span>
            </div>
            <div className="time-scale">
              {timeMarks.map((mark) => (
                <div
                  className="time-mark"
                  key={`${mark.label}-${mark.leftPercent}`}
                  style={{ left: `${mark.leftPercent}%` }}
                >
                  <span>{mark.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tracks">
            {filteredTournaments.map((tournament) => {
              const start = resolvedStarts.get(tournament.id) ?? baseline;
              const placement = getPlacement(tournament, start, currentTime, rangeHours);
              const end = start + tournament.durationMinutes * MINUTE_MS;
              const meta = statusMeta[tournament.status];

              return (
                <article className="track-row" key={tournament.id}>
                  <div className="row-label">
                    <strong>{tournament.tableNumber}</strong>
                    <span>{tournament.buyIn}</span>
                  </div>

                  <div className="track-lane">
                    {timeMarks.map((mark) => (
                      <span
                        className="lane-gridline"
                        key={`${tournament.id}-${mark.leftPercent}`}
                        style={{ left: `${mark.leftPercent}%` }}
                      />
                    ))}

                    {placement.isVisible && (
                      <button
                        className={`tournament-card status-${meta.tone}`}
                        type="button"
                        style={{
                          left: `${placement.leftPercent}%`,
                          width: `${placement.widthPercent}%`,
                        }}
                        onClick={() => setSelectedTournament(tournament)}
                        aria-label={`Open details for ${tournament.name}`}
                      >
                        <span className="card-title">{tournament.name}</span>
                        <span className="card-meta">
                          <span aria-hidden="true">P</span>
                          {tournament.registeredPlayers}/{tournament.maxPlayers}
                        </span>
                        <span className={`status-pill status-${meta.tone}`}>
                          {meta.label}
                        </span>
                        <span className="tooltip" role="tooltip">
                          Starts {timeFormatter.format(start)} - Ends {timeFormatter.format(end)} -{' '}
                          {tournament.prizePool}
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      {selectedTournament && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedTournament(null)}
        >
          <section
            className="details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              onClick={() => setSelectedTournament(null)}
              aria-label="Close details"
            >
              x
            </button>
            <p className="eyebrow">{selectedTournament.id}</p>
            <h2 id="details-title">{selectedTournament.name}</h2>
            <p>{selectedTournament.description}</p>

            <div className="details-grid">
              <span>Buy-in</span>
              <strong>{selectedTournament.buyIn}</strong>
              <span>Status</span>
              <strong>{statusMeta[selectedTournament.status].label}</strong>
              <span>Players</span>
              <strong>
                {selectedTournament.registeredPlayers}/{selectedTournament.maxPlayers}
              </strong>
              <span>Prize Pool</span>
              <strong>{selectedTournament.prizePool}</strong>
              <span>Blind Structure</span>
              <strong>{selectedTournament.blindStructure}</strong>
              <span>Late Registration</span>
              <strong>{selectedTournament.lateRegistrationMinutes} min</strong>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
