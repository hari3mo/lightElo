import { Chess } from 'chess.js';
import { AIDifficulty } from '../types';

// Piece Square Tables (PST) reward development, center control, safety, and offensive pressure.
// All tables are relative to White's side. For Black, we flip the board vertically.
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 5, 0, 0]
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 5, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20]
];

const KING_MID_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20]
];

// In endgame, kings are encouraged to activate and march towards center
const KING_END_PST = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50]
];

// Base values of the pieces
const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Check if game is in the endgame stage (less total material on board)
function isEndgame(chess: Chess): boolean {
  let majorPieces = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type !== 'p' && piece.type !== 'k') {
        majorPieces++;
      }
    }
  }
  return majorPieces <= 4;
}

// Evaluate position static score (from perspective of active player or absolute score where White is positive, Black is negative)
export function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();
  const endgame = isEndgame(chess);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const type = piece.type;
      const color = piece.color;
      let pieceValue = PIECE_VALUES[type];

      // Add positional weights from PST
      let pstValue = 0;
      const pRow = color === 'w' ? r : 7 - r;
      const pCol = color === 'w' ? c : 7 - c;

      switch (type) {
        case 'p':
          pstValue = PAWN_PST[pRow][pCol];
          break;
        case 'n':
          pstValue = KNIGHT_PST[pRow][pCol];
          break;
        case 'b':
          pstValue = BISHOP_PST[pRow][pCol];
          break;
        case 'r':
          pstValue = ROOK_PST[pRow][pCol];
          break;
        case 'q':
          pstValue = QUEEN_PST[pRow][pCol];
          break;
        case 'k':
          pstValue = endgame ? KING_END_PST[pRow][pCol] : KING_MID_PST[pRow][pCol];
          break;
      }

      const totalVal = pieceValue + pstValue;

      if (color === 'w') {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  return score;
}

// Alpha-Beta Minimax search implementation
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): { score: number; move: string | null } {
  // If we are at leaf node or game is over, return evaluation score
  if (depth === 0 || chess.isGameOver()) {
    const score = evaluateBoard(chess);
    return { score, move: null };
  }

  // Get all legal moves
  const moves = chess.moves({ verbose: true });
  
  // Sort moves slightly for better alpha-beta pruning (captures of high-value pieces first)
  moves.sort((a, b) => {
    const aValue = a.captured ? PIECE_VALUES[a.captured] : 0;
    const bValue = b.captured ? PIECE_VALUES[b.captured] : 0;
    return bValue - aValue;
  });

  if (moves.length === 0) {
    if (chess.isCheckmate()) {
      // If active player is checkmated, evaluate appropriately
      return {
        score: isMaximizingPlayer ? -150000 + (3 - depth) : 150000 - (3 - depth),
        move: null
      };
    }
    return { score: 0, move: null }; // Stalemate/Draw
  }

  let bestMove: string | null = null;

  if (isMaximizingPlayer) {
    let maxScore = -Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      const { score } = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();

      if (score > maxScore) {
        maxScore = score;
        bestMove = move.lan || `${move.from}${move.to}${move.promotion || ''}`;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break; // beta cutoff
      }
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || 'q' });
      const { score } = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      if (score < minScore) {
        minScore = score;
        bestMove = move.lan || `${move.from}${move.to}${move.promotion || ''}`;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        break; // alpha cutoff
      }
    }
    return { score: minScore, move: bestMove };
  }
}

// Generate the best move for a given AI difficulty
export function getAIMove(fen: string, difficulty: AIDifficulty): string {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return '';

  const activeColor = chess.turn();
  const isMaximizing = activeColor === 'w';

  // Level 1: Novice - Picks random move, with 33% chance to capture if a free capture exists
  if (difficulty === 'novice') {
    const captures = moves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.4) {
      const idx = Math.floor(Math.random() * captures.length);
      return `${captures[idx].from}${captures[idx].to}${captures[idx].promotion || ''}`;
    }
    const idx = Math.floor(Math.random() * moves.length);
    return `${moves[idx].from}${moves[idx].to}${moves[idx].promotion || ''}`;
  }

  // Level 2: Casual - Minimax Depth 1 (looks ahead exactly 1 turn to make simple logical decisions)
  if (difficulty === 'casual') {
    const { move } = minimax(chess, 1, -Infinity, Infinity, isMaximizing);
    return move || '';
  }

  // Level 3: Intermediate - Minimax Depth 3 (looks ahead 3 half-moves with pruning, very tactical)
  if (difficulty === 'intermediate') {
    const { move } = minimax(chess, 2, -Infinity, Infinity, isMaximizing);
    return move || '';
  }

  // Level 4: Master - Minimax Depth 3 or 4
  if (difficulty === 'master') {
    const { move } = minimax(chess, 3, -Infinity, Infinity, isMaximizing);
    return move || '';
  }

  // Fallback
  return `${moves[0].from}${moves[0].to}${moves[0].promotion || ''}`;
}

// Provide evaluation scale (e.g. "+1.5", "-0.7")
export function getPositionStats(fen: string): { score: number; label: string } {
  const chess = new Chess(fen);
  const scoreInCents = evaluateBoard(chess);
  const scoreInPawns = scoreInCents / 100;
  
  let label = 'Even';
  if (scoreInPawns > 1.2) label = 'White has upper hand';
  if (scoreInPawns > 3.0) label = 'White is winning';
  if (scoreInPawns < -1.2) label = 'Black has upper hand';
  if (scoreInPawns < -3.0) label = 'Black is winning';

  return {
    score: scoreInPawns,
    label
  };
}
