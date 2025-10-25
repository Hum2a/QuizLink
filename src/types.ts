export interface Player {
  id: string;
  name: string;
  score: number;
  isAdmin: boolean;
  hasAnswered: boolean;
  iconName?: string;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number | null;
}

export interface GameState {
  players: Player[];
  currentQuestion: number;
  isQuizActive: boolean;
  showResults: boolean;
  totalQuestions: number;
  question: Question | null;
  answers: Record<string, number>;
  roomCode: string;
}
