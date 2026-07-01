import type { TimeMark, Tournament } from '../types';
import { getPlacement, getTournamentEndTime } from '../utils/timeline';
import TournamentCard from './TournamentCard';

type TrackRowProps = {
  tournament: Tournament;
  startTime: number;
  currentTime: number;
  rangeHours: number;
  timelineHours: number;
  timeMarks: TimeMark[];
  onSelectTournament: (tournament: Tournament) => void;
};

function TrackRow({
  tournament,
  startTime,
  currentTime,
  rangeHours,
  timelineHours,
  timeMarks,
  onSelectTournament,
}: TrackRowProps) {
  const placement = getPlacement(tournament, startTime, currentTime, rangeHours, timelineHours);
  const endTime = getTournamentEndTime(tournament, startTime);

  return (
    <article className="track-row">
      <div className="track-lane">
        {timeMarks.map((mark) => (
          <span
            className="lane-gridline"
            key={`${tournament.id}-${mark.leftPercent}`}
            style={{ left: `${mark.leftPercent}%` }}
          />
        ))}

        <TournamentCard
          tournament={tournament}
          startTime={startTime}
          endTime={endTime}
          placement={placement}
          onSelect={onSelectTournament}
        />
      </div>
    </article>
  );
}

export default TrackRow;
