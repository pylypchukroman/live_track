import type { StatusFilter, Tournament } from '../types';
import { getEffectiveStatus, parseStartTime } from './timeline';

export function filterTournaments(
  tournaments: Tournament[],
  query: string,
  statusFilter: StatusFilter,
  resolvedStarts: Map<string, number>,
  currentTime: number,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return tournaments.filter((tournament) => {
    const startTime = resolvedStarts.get(tournament.id) ?? currentTime;
    const effectiveStatus = getEffectiveStatus(tournament, startTime, currentTime);
    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
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
