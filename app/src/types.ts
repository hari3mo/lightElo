export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessPieceData {
  type: PieceType;
  color: PieceColor;
  square: string;
}

export type GameMode = 'predictor' | 'sandbox';

export type AIDifficulty = 'novice' | 'casual' | 'intermediate' | 'master';

export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  lightHighlight: string;
  darkHighlight: string;
  background: string;
  primary: string;
  primaryLight: string;
  accent: string;
}

export interface GameMove {
  san: string;
  from: string;
  to: string;
  color: PieceColor;
  piece: PieceType;
  captured?: PieceType;
  promotion?: string;
  fenBefore: string;
  fenAfter: string;
  comment?: string;
  clockTime?: string;
}

export interface ChessPuzzle {
  id: string;
  title: string;
  description: string;
  initialFen: string;
  solution: string[]; // Sequential moves required to solve, e.g. ["e2e4", "e7e5"]
  sideToPlay: PieceColor;
  hint: string;
  successMessage: string;
}
