export type TournamentStatus =
  | 'scheduled'
  | 'registering'
  | 'closing-soon'
  | 'running'
  | 'final-table'
  | 'finished';

export type Tournament = {
  id: string;
  tableNumber: string;
  name: string;
  stakes: string;
  buyIn: string;
  startTime: string;
  durationMinutes: number;
  registeredPlayers: number;
  maxPlayers: number;
  status: TournamentStatus;
  prizePool: string;
  blindStructure: string;
  lateRegistrationMinutes: number;
  description: string;
};

export type TimelinePlacement = {
  leftPercent: number;
  widthPercent: number;
  isVisible: boolean;
};
