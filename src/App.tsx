import { useEffect, useMemo, useState } from 'react';
import ControlBar from './components/ControlBar';
import TimelineBoard from './components/TimelineBoard';
import TournamentDetailsModal from './components/TournamentDetailsModal';
import { statusMeta } from './constants/status';
import { MINUTE_MS } from './constants/timeline';
import tournamentsJson from './data/tournaments.json';
import type { StatusFilter, Tournament } from './types';
import { buildTimeMarks, getEffectiveStatus, getTimelineScrollHours } from './utils/timeline';
import { filterTournaments, resolveTournamentStarts } from './utils/tournaments';

function App() {
  const baseline = useMemo(() => Date.now(), []);
  const tournaments = tournamentsJson as Tournament[];
  const [currentTime, setCurrentTime] = useState(baseline);
  const [rangeHours, setRangeHours] = useState(6);
  const [isPaused, setIsPaused] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const timelineHours = getTimelineScrollHours(rangeHours);

  const resolvedStarts = useMemo(
    () => resolveTournamentStarts(tournaments, baseline),
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
    () => buildTimeMarks(currentTime, rangeHours, timelineHours),
    [currentTime, rangeHours, timelineHours],
  );

  const filteredTournaments = useMemo(() => {
    return filterTournaments(tournaments, query, statusFilter, resolvedStarts, currentTime);
  }, [currentTime, query, resolvedStarts, statusFilter, tournaments]);

  function handlePauseToggle() {
    if (isPaused) {
      setCurrentTime(Date.now());
    }

    setIsPaused((value) => !value);
  }

  return (
    <main className="app-shell">
      <section className="board">
        <header className="topbar">
          <div>
            <p className="eyebrow">Live Track</p>
            <h1>Poker Tournament Timeline</h1>
          </div>

          <ControlBar
            query={query}
            statusFilter={statusFilter}
            rangeHours={rangeHours}
            isPaused={isPaused}
            onQueryChange={setQuery}
            onStatusFilterChange={setStatusFilter}
            onRangeHoursChange={setRangeHours}
            onPauseToggle={handlePauseToggle}
          />
        </header>

        <div className="legend" aria-label="Status legend">
          {Object.entries(statusMeta).map(([status, meta]) => (
            <span className="legend-item" key={status}>
              <i className={`legend-dot status-${meta.tone}`} aria-hidden="true" />
              {meta.label}
            </span>
          ))}
        </div>

        <TimelineBoard
          tournaments={filteredTournaments}
          baseline={baseline}
          currentTime={currentTime}
          rangeHours={rangeHours}
          timelineHours={timelineHours}
          timeMarks={timeMarks}
          resolvedStarts={resolvedStarts}
          onSelectTournament={setSelectedTournament}
        />
      </section>

      {selectedTournament && (
        <TournamentDetailsModal
          tournament={selectedTournament}
          status={getEffectiveStatus(
            selectedTournament,
            resolvedStarts.get(selectedTournament.id) ?? baseline,
            currentTime,
          )}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </main>
  );
}

export default App;
