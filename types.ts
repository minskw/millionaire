export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  explanation?: string; // Optional explanation for the class
}

export interface GameState {
  currentQuestionIndex: number;
  money: number;
  lifelines: {
    fiftyFifty: boolean;
    phoneFriend: boolean;
    askAudience: boolean;
  };
  status: 'menu' | 'playing' | 'victory' | 'gameover';
  questions: Question[];
  selectedAnswerIndex: number | null;
  isAnswerRevealed: boolean;
  wrongAnswersEliminated: number[]; // Indices of answers removed by 50:50
}

export const MONEY_LADDER = [
  100, 200, 300, 500, 1000,
  2000, 4000, 8000, 16000, 32000,
  64000, 125000, 250000, 500000, 1000000
];

export const SAFETY_NETS = [4, 9]; // Indices (1000, 32000)