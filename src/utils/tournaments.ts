import type { StatusFilter, Tournament } from '../types';
import { parseStartTime } from './timeline';

export function filterTournaments(
  tournaments: Tournament[],
  query: string,
  statusFilter: StatusFilter,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return tournaments.filter((tournament) => {
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      tournament.name.toLowerCase().includes(normalizedQuery) ||
      tournament.buyIn.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

export function resolveTournamentStarts(tournaments: Tournament[], baseline: number) {
  return new Map(
    tournaments.map((tournament) => [
      tournament.id,
      parseStartTime(tournament.startTime, baseline),
    ]),
  );
}
