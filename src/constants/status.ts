import type { StatusFilter, StatusMeta, TournamentStatus } from '../types';

export const statusMeta: Record<TournamentStatus, StatusMeta> = {
  scheduled: { label: 'Scheduled', tone: 'slate' },
  registering: { label: 'Registering', tone: 'green' },
  'closing-soon': { label: 'Closing Soon', tone: 'amber' },
  running: { label: 'Running', tone: 'blue' },
  'final-table': { label: 'Final Table', tone: 'red' },
  finished: { label: 'Finished', tone: 'muted' },
};

export const statusOptions: StatusFilter[] = [
  'all',
  'scheduled',
  'registering',
  'closing-soon',
  'running',
  'final-table',
  'finished',
];
