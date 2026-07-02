import { statusMeta } from '../constants/status';
import { timeFormatter } from '../constants/timeline';
import type { TimelinePlacement, Tournament, TournamentStatus } from '../types';

type TournamentCardProps = {
  tournament: Tournament;
  status: TournamentStatus;
  startTime: number;
  endTime: number;
  placement: TimelinePlacement;
  onSelect: (tournament: Tournament) => void;
};

function TournamentCard({
  tournament,
  status,
  startTime,
  endTime,
  placement,
  onSelect,
}: TournamentCardProps) {
  if (!placement.isVisible) {
    return null;
  }

  const meta = statusMeta[status];

  return (
    <button
      className={`tournament-card status-${meta.tone}`}
      type="button"
      style={{
        left: `${placement.leftPercent}%`,
        width: `${placement.widthPercent}%`,
        minWidth: placement.isClipped ? 0 : undefined,
      }}
      onClick={() => onSelect(tournament)}
      aria-label={`Open details for ${tournament.name}`}
    >
      <span className="card-title">{tournament.name}</span>
      <span className="card-meta">
        <span aria-hidden="true">P</span>
        {tournament.registeredPlayers}/{tournament.maxPlayers}
      </span>
      <span className={`status-pill status-${meta.tone}`}>{meta.label}</span>
      <span className="tooltip" role="tooltip">
        Starts {timeFormatter.format(startTime)} - Ends {timeFormatter.format(endTime)} -{' '}
        {tournament.prizePool}
      </span>
    </button>
  );
}

export default TournamentCard;
