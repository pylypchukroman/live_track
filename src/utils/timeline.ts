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
  scrollHours = rangeHours,
): TimelinePlacement {
  const { totalRangeMs, windowStart, windowEnd } = getTimelineWindow(
    currentTime,
    rangeHours,
    scrollHours,
  );
  const endTime = getTournamentEndTime(tournament, resolvedStart);
  const visibleStart = Math.max(resolvedStart, windowStart);
  const visibleEnd = Math.min(endTime, windowEnd);
  const leftPercent = ((visibleStart - windowStart) / totalRangeMs) * 100;
  const widthPercent = ((visibleEnd - visibleStart) / totalRangeMs) * 100;

  return {
    leftPercent,
    widthPercent,
    isVisible: endTime > windowStart && resolvedStart < windowEnd,
    isClipped: resolvedStart < windowStart || endTime > windowEnd,
  };
}

export function buildTimeMarks(
  currentTime: number,
  rangeHours: number,
  scrollHours = rangeHours,
): TimeMark[] {
  const stepMs = getTimelineStepMs(rangeHours);
  const { totalRangeMs, windowStart, windowEnd } = getTimelineWindow(
    currentTime,
    rangeHours,
    scrollHours,
  );
  const firstMark = Math.ceil(windowStart / stepMs) * stepMs;
  const markCount = Math.max(0, Math.floor((windowEnd - firstMark) / stepMs) + 1);

  const marks = Array.from({ length: markCount }, (_, index) => {
    const value = firstMark + index * stepMs;
    const isEndBoundary = value === windowEnd;

    return {
      label: isEndBoundary ? '' : timeFormatter.format(value),
      leftPercent: ((value - windowStart) / totalRangeMs) * 100,
    };
  });

  return marks;
}

export function getTimelineScrollHours(rangeHours: number) {
  return rangeHours === 3 ? 6 : rangeHours;
}

export function getNowLinePercent(rangeHours: number, scrollHours = rangeHours) {
  const { pastRangeMs, totalRangeMs } = getTimelineWindow(0, rangeHours, scrollHours);

  return (pastRangeMs / totalRangeMs) * 100;
}

export function getTimelineContentWidthPercent(rangeHours: number, scrollHours = rangeHours) {
  const viewWindow = getTimelineWindow(0, rangeHours, rangeHours);
  const scrollWindow = getTimelineWindow(0, rangeHours, scrollHours);

  return (scrollWindow.totalRangeMs / viewWindow.totalRangeMs) * 100;
}

function getTimelineWindow(currentTime: number, rangeHours: number, scrollHours: number) {
  const visibleRangeMs = rangeHours * HOUR_MS;
  const futureWidthPercent = 100 - NOW_OFFSET_PERCENT;
  const pastRangeMs = (NOW_OFFSET_PERCENT / futureWidthPercent) * visibleRangeMs;
  const stepMs = getTimelineStepMs(rangeHours);
  const rawWindowEnd = currentTime + scrollHours * HOUR_MS;
  const windowEnd = Math.ceil(rawWindowEnd / stepMs) * stepMs;
  const futureRangeMs = Math.max(stepMs, windowEnd - currentTime);
  const totalRangeMs = pastRangeMs + futureRangeMs;
  const windowStart = currentTime - pastRangeMs;

  return { pastRangeMs, totalRangeMs, windowStart, windowEnd };
}

function getTimelineStepMs(rangeHours: number) {
  const stepMinutes = rangeHours <= 3 ? 15 : rangeHours <= 6 ? 30 : 60;

  return stepMinutes * MINUTE_MS;
}
