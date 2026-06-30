export const HOUR_MS = 60 * 60 * 1000;
export const MINUTE_MS = 60 * 1000;
export const NOW_OFFSET_PERCENT = 20;
export const TIME_RANGE_OPTIONS = [3, 6, 12] as const;

export const timeFormatter = new Intl.DateTimeFormat([], {
  hour: '2-digit',
  minute: '2-digit',
});
