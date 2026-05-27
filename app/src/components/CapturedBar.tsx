import React from 'react';
import { ChessPiece } from './ChessPieces';
import { PieceType, PieceColor } from '../types';

interface PlayerCapturedBarProps {
  capturedPieces: PieceType[];
  capturedPiecesColor: PieceColor; // the color of the pieces that were captured
  advantage: number; // positive if this player has material advantage
}

const PIECE_SCORES: Record<PieceType, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

const groupCapturedPieces = (pieces: PieceType[]): { type: PieceType; count: number }[] => {
  const list: Record<PieceType, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  pieces.forEach(p => {
    list[p]++;
  });
  const order: PieceType[] = ['p', 'b', 'n', 'r', 'q'];
  return order
    .filter(type => list[type] > 0)
    .map(type => ({ type, count: list[type] }));
};

export const PlayerCapturedBar: React.FC<PlayerCapturedBarProps> = ({ capturedPieces, capturedPiecesColor, advantage }) => {
  const grouped = groupCapturedPieces(capturedPieces);

  if (grouped.length === 0 && advantage === 0) {
    return null; // hide if nothing captured and no advantage
  }

  return (
    <div className="flex items-center gap-1 h-6 opacity-90 select-none">
      {grouped.map(({ type, count }) => (
        <div key={type} className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-1 py-0.5 rounded shadow-sm">
          <div className="w-3.5 h-3.5">
            <ChessPiece type={type} color={capturedPiecesColor} />
          </div>
          {count > 1 && (
            <span className="font-mono text-[8px] font-bold text-zinc-500 ml-0.5 mt-0.5">
              ×{count}
            </span>
          )}
        </div>
      ))}
      {advantage > 0 && (
        <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 ml-1.5 mt-0.5">
          +{advantage}
        </span>
      )}
      {advantage < 0 && (
        <span className="font-mono text-[9px] font-bold text-red-600 dark:text-red-400 ml-1.5 mt-0.5">
          {advantage}
        </span>
      )}
    </div>
  );
};

