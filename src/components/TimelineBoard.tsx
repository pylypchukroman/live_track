import type { TimeMark, Tournament } from '../types';
import TimelineHeader from './TimelineHeader';
import TrackRow from './TrackRow';

type TimelineBoardProps = {
  tournaments: Tournament[];
  baseline: number;
  currentTime: number;
  rangeHours: number;
  timeMarks: TimeMark[];
  resolvedStarts: Map<string, number>;
  onSelectTournament: (tournament: Tournament) => void;
};

function TimelineBoard({
  tournaments,
  baseline,
  currentTime,
  rangeHours,
  timeMarks,
  resolvedStarts,
  onSelectTournament,
}: TimelineBoardProps) {
  return (
    <section className="timeline-panel" aria-label="Tournament schedule timeline">
      <div className="now-line" aria-hidden="true" />

      <TimelineHeader timeMarks={timeMarks} />

      <div className="tracks">
        {tournaments.map((tournament) => (
          <TrackRow
            key={tournament.id}
            tournament={tournament}
            startTime={resolvedStarts.get(tournament.id) ?? baseline}
            currentTime={currentTime}
            rangeHours={rangeHours}
            timeMarks={timeMarks}
            onSelectTournament={onSelectTournament}
          />
        ))}
      </div>
    </section>
  );
}

export default TimelineBoard;
