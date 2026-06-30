import { HOUR_MS, MINUTE_MS, NOW_OFFSET_PERCENT, timeFormatter } from '../constants/timeline';
import type { TimeMark, TimelinePlacement, Tournament } from '../types';

export function parseStartTime(startTime: string, baseline: number) {
  const relativeMatch = startTime.match(/^(-?\d+)m$/);

  if (relativeMatch) {
    return baseline + Number(relativeMatch[1]) * MINUTE_MS;
  }

  return new Date(startTime).getTime();
}

export function getTournamentEndTime(tournament: Tournament, startTime: number) {
  return startTime + tournament.durationMinutes * MINUTE_MS;
}

export function getPlacement(
  tournament: Tournament,
  resolvedStart: number,
  currentTime: number,
  rangeHours: number,
): TimelinePlacement {
  const visibleRangeMs = rangeHours * HOUR_MS;
  const futureWidthPercent = 100 - NOW_OFFSET_PERCENT;
  const pastRangeMs = (NOW_OFFSET_PERCENT / futureWidthPercent) * visibleRangeMs;
  const endTime = getTournamentEndTime(tournament, resolvedStart);
  const leftPercent =
    NOW_OFFSET_PERCENT + ((resolvedStart - currentTime) / visibleRangeMs) * futureWidthPercent;
  const widthPercent = ((endTime - resolvedStart) / visibleRangeMs) * futureWidthPercent;

  return {
    leftPercent,
    widthPercent,
    isVisible:
      endTime >= currentTime - pastRangeMs && resolvedStart <= currentTime + visibleRangeMs,
  };
}

export function buildTimeMarks(currentTime: number, rangeHours: number): TimeMark[] {
  const stepMinutes = rangeHours <= 3 ? 15 : rangeHours <= 6 ? 30 : 60;
  const stepMs = stepMinutes * MINUTE_MS;
  const visibleRangeMs = rangeHours * HOUR_MS;
  const futureWidthPercent = 100 - NOW_OFFSET_PERCENT;
  const pastRangeMs = (NOW_OFFSET_PERCENT / futureWidthPercent) * visibleRangeMs;
  const futureMarks = Math.floor(visibleRangeMs / stepMs);
  const pastMarks = Math.floor(pastRangeMs / stepMs);

  return Array.from({ length: pastMarks + futureMarks + 1 }, (_, index) => {
    const stepIndex = index - pastMarks;
    const value = currentTime + stepIndex * stepMs;

    return {
      label: stepIndex === 0 ? '' : timeFormatter.format(value),
      leftPercent: NOW_OFFSET_PERCENT + (stepIndex * stepMs * futureWidthPercent) / visibleRangeMs,
    };
  });
}
