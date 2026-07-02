import { statusMeta } from '../constants/status';
import type { Tournament, TournamentStatus } from '../types';

type TournamentDetailsModalProps = {
  tournament: Tournament;
  status: TournamentStatus;
  onClose: () => void;
};

function TournamentDetailsModal({ tournament, status, onClose }: TournamentDetailsModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label="Close details">
          x
        </button>
        <h2 id="details-title">{tournament.name}</h2>
        <p>{tournament.description}</p>

        <div className="details-grid">
          <span>Buy-in</span>
          <strong>{tournament.buyIn}</strong>
          <span>Status</span>
          <strong>{statusMeta[status].label}</strong>
          <span>Players</span>
          <strong>
            {tournament.registeredPlayers}/{tournament.maxPlayers}
          </strong>
          <span>Prize Pool</span>
          <strong>{tournament.prizePool}</strong>
          <span>Blind Structure</span>
          <strong>{tournament.blindStructure}</strong>
          <span>Late Registration</span>
          <strong>{tournament.lateRegistrationMinutes} min</strong>
        </div>
      </section>
    </div>
  );
}

export default TournamentDetailsModal;
