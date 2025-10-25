export interface Player {
  id: string;
  socketId: string | null;
  name: string;
  score: number;
  isAdmin: boolean;
  hasAnswered: boolean;
  joinedAt: number;
  iconName?: string;
}

export interface Question {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  displayOrder: number;
}

export interface GameState {
  gameId: string;
  roomCode: string;
  hostName: string;
  players: Player[];
  currentQuestion: number;
  isQuizActive: boolean;
  showResults: boolean;
  status: 'lobby' | 'active' | 'completed';
  questions: Question[];
  answers: Record<string, number>; // playerId -> answerIndex
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

export interface WebSocketMessage {
  type:
    | 'join-game'
    | 'start-quiz'
    | 'submit-answer'
    | 'reveal-answers'
    | 'next-question'
    | 'reset-game'
    | 'update-player-icon'
    | 'game-state-update'
    | 'error';
  payload?: any;
}

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
  HYPERDRIVE: Hyperdrive;
  DATABASE_URL: string;
}
