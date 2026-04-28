import { GameType } from './components/ScoreBoard';

export interface UserProfile {
  id: string;
  username: string;
  avatarSeed: string;
  createdAt: number;
}

export interface MatchRecord {
  id: string;
  gameType: GameType;
  p1: { id: string, name: string, score: number };
  p2: { id: string, name: string, score: number };
  winnerId: string | 'draw';
  timestamp: number;
}

export interface UserStats {
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winRate: number;
  streaks: {
    current: number;
    longest: number;
  };
  byGameType: Record<GameType, { wins: number, losses: number }>;
}
