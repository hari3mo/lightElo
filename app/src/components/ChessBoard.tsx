import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { ChessPiece } from './ChessPieces';
import { BoardTheme, PieceType, PieceColor } from '../types';
import { Button } from '@/components/ui/button';
import { getAIMove, getPositionStats } from '../utils/ai';

interface ChessBoardProps {
  fen: string;
  onMove: (from: string, to: string, promotion?: string, botMove?: boolean) => void;
  activeTheme: BoardTheme;
  interactive: boolean;
  showCoordinates: boolean;
  isFlipped: boolean;
  botDifficulty: string;
  gameMode: string;
  selectedSquare: string | null;
  setSelectedSquare: (sq: string | null) => void;
  highlightedMoves: string[];
  setHighlightedMoves: (moves: string[]) => void;
  lastMove: { from: string; to: string } | null;
  kingInCheckSq: string | null;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  onMove,
  activeTheme,
  interactive,
  showCoordinates,
  isFlipped,
  botDifficulty,
  gameMode,
  selectedSquare,
  setSelectedSquare,
  highlightedMoves,
  setHighlightedMoves,
  lastMove,
  kingInCheckSq,
}) => {
  const [chessInstance, setChessInstance] = useState<Chess>(new Chess(fen));
  
  // Pending promotion state details
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string; square: string } | null>(null);

  // Sync internal chess engine state with incoming prop FEN changes
  useEffect(() => {
    try {
      setChessInstance(new Chess(fen));
    } catch (e) {
      console.error("Invalid FEN updated", fen);
    }
  }, [fen]);

  const rawBoard = chessInstance.board();
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Setup loop rows/cols based on flip state
  const rowIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  // Helper to resolve algebraic square name
  const getSquareName = (r: number, c: number): string => {
    return files[c] + ranks[r];
  };

  // Helper to check if a square is black
  const isDarkSquare = (r: number, c: number): boolean => {
    return (r + c) % 2 === 1;
  };

  // Check if a square has a legal move possible
  const getMoveForSquare = (targetSq: string): string | null => {
    return highlightedMoves.find(m => m === targetSq) || null;
  };

  // Click square handler
  const handleSquareClick = (squareName: string) => {
    if (!interactive || promotionPending) return;

    // Is the user playing some move on an highlighted target?
    if (selectedSquare && getMoveForSquare(squareName)) {
      triggerMoveSelection(selectedSquare, squareName);
      return;
    }

    // Inspect piece on square to select it
    const piece = chessInstance.get(squareName as Square);
    
    // User is choosing a piece to move. Ensure turn correctness or sandbox mode
    const isOurTurn = piece && piece.color === chessInstance.turn();
    const sandboxMode = gameMode === 'sandbox';

    if (piece && (isOurTurn || sandboxMode)) {
      setSelectedSquare(squareName);
      
      // Load legal destinations
      const moves = chessInstance.moves({ square: squareName as Square, verbose: true });
      const targetSquares = moves.map(m => m.to);
      setHighlightedMoves(targetSquares);
    } else {
      // Clear selection
      setSelectedSquare(null);
      setHighlightedMoves([]);
    }
  };

  // Process a move transition
  const triggerMoveSelection = (from: string, to: string) => {
    const piece = chessInstance.get(from as Square);
    if (!piece) return;

    // Check if this move constitutes pawn promotion
    const isPawn = piece.type === 'p';
    const isPromotionRank = to.endsWith('8') || to.endsWith('1');
    
    if (isPawn && isPromotionRank) {
      setPromotionPending({ from, to, square: to });
      return;
    }

    // Standard non-promoting move
    onMove(from, to);
    setSelectedSquare(null);
    setHighlightedMoves([]);
  };

  // Handle final promotion piece selection
  const handlePromotionSelect = (pieceChar: string) => {
    if (!promotionPending) return;
    onMove(promotionPending.from, promotionPending.to, pieceChar);
    setPromotionPending(null);
    setSelectedSquare(null);
    setHighlightedMoves([]);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, squareName: string) => {
    if (!interactive || promotionPending) {
      e.preventDefault();
      return;
    }

    const piece = chessInstance.get(squareName as Square);
    const isOurTurn = piece && piece.color === chessInstance.turn();
    const sandboxMode = gameMode === 'sandbox';

    if (!piece || (!isOurTurn && !sandboxMode)) {
      e.preventDefault();
      return;
    }

    // Set dragging context
    e.dataTransfer.setData('text/plain', squareName);
    e.dataTransfer.effectAllowed = 'move';

    // Simulate clicking to show valid choices immediately
    setSelectedSquare(squareName);
    const moves = chessInstance.moves({ square: squareName as Square, verbose: true });
    setHighlightedMoves(moves.map(m => m.to));
  };

  const handleDragOver = (e: React.DragEvent, squareName: string) => {
    e.preventDefault();
    if (selectedSquare && getMoveForSquare(squareName)) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDrop = (e: React.DragEvent, squareName: string) => {
    e.preventDefault();
    const fromSquare = e.dataTransfer.getData('text/plain');
    
    if (fromSquare && fromSquare !== squareName && getMoveForSquare(squareName)) {
      triggerMoveSelection(fromSquare, squareName);
    } else {
      // Clear highlight if dropped invalid
      setSelectedSquare(null);
      setHighlightedMoves([]);
    }
  };

  // Render the promotion dialog inside the board boundary
  const renderPromotionOverlay = () => {
    if (!promotionPending) return null;

    const promotionOptions = [
      { type: 'q', label: 'Queen' },
      { type: 'r', label: 'Rook' },
      { type: 'b', label: 'Bishop' },
      { type: 'n', label: 'Knight' },
    ] as const;

    // Promotion piece color is the turn color
    const promoColor = chessInstance.turn();

    return (
      <div className="absolute inset-0 z-50 bg-neutral-950/70 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-2xl max-w-xs text-center">
          <h3 className="font-sans font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 mb-2 text-md">
            Pawn Promotion
          </h3>
          <p className="font-sans text-xs text-neutral-500 mb-5">
            Choose a replacement officer for your pawn.
          </p>
          <div className="grid grid-cols-4 gap-3 bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800/60 shadow-inner">
            {promotionOptions.map((opt) => (
              <button
                key={opt.type}
                id={`promote-${opt.type}`}
                onClick={() => handlePromotionSelect(opt.type)}
                className="hover:scale-105 active:scale-95 flex flex-col items-center justify-center p-2 rounded-lg bg-white dark:bg-neutral-900 shadow-sm border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10">
                  <ChessPiece type={opt.type} color={promoColor} />
                </div>
                <span className="font-sans text-[10px] font-medium text-neutral-500 mt-1.5 group-hover:text-primary transition-colors">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPromotionPending(null)}
            className="mt-4 text-xs font-sans text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-[12px] border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl select-none">
      {/* Board grids and squares */}
      <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0 overflow-hidden">
        {rowIndices.map((r) =>
          colIndices.map((c) => {
            const squareName = getSquareName(r, c);
            const piece = rawBoard[r][c];
            const isDark = isDarkSquare(r, c);
            
            // Resolve base color
            let sqBackgroundColor = isDark ? activeTheme.darkSquare : activeTheme.lightSquare;
            
            // Check custom overlay highlights
            const isSelected = selectedSquare === squareName;
            const isLastMoveSqr = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
            const isTargetedMove = getMoveForSquare(squareName);
            const isKingCheck = kingInCheckSq === squareName;

            let overlayClass = '';

            // Apply hover colors or highlight mixtures
            if (isSelected) {
              sqBackgroundColor = isDark ? activeTheme.darkHighlight : activeTheme.lightHighlight;
            } else if (isKingCheck) {
              overlayClass = 'bg-red-500/50 ring-4 ring-red-500/80 ring-inset animate-pulse';
            } else if (isLastMoveSqr) {
              overlayClass = 'bg-zinc-500/35 border-zinc-500/40 border-2 border-dashed';
            }

            // Resolve coordinates markers (on bottom row for files, on left column for ranks)
            const showRank = showCoordinates && (isFlipped ? c === 7 : c === 0);
            const showFile = showCoordinates && (isFlipped ? r === 0 : r === 7);

            return (
              <div
                key={squareName}
                id={`square-${squareName}`}
                onClick={() => handleSquareClick(squareName)}
                onDragOver={(e) => handleDragOver(e, squareName)}
                onDrop={(e) => handleDrop(e, squareName)}
                className={`relative flex items-center justify-center transition-colors duration-150 cursor-pointer aspect-square`}
                style={{ backgroundColor: sqBackgroundColor }}
              >
                {overlayClass && (
                  <div className={`absolute inset-0 pointer-events-none ${overlayClass}`} />
                )}
                {/* Visual coordinate indexes mapped directly inside edge cells */}
                {showRank && (
                  <span
                    className={`absolute top-1 left-1.5 font-mono font-bold text-[9px] xl:text-[10px] leading-none ${
                      isDark ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    {ranks[r]}
                  </span>
                )}
                {showFile && (
                  <span
                    className={`absolute bottom-0.5 right-1.5 font-mono font-bold text-[9px] xl:text-[10px] leading-none ${
                      isDark ? 'text-neutral-300' : 'text-neutral-500'
                    }`}
                  >
                    {files[c]}
                  </span>
                )}

                {/* Render the Chess Piece inside */}
                {piece && (
                  <div
                    id={`piece-${squareName}`}
                    draggable={interactive && !promotionPending}
                    onDragStart={(e) => handleDragStart(e, squareName)}
                    className="w-[88%] h-[88%] flex items-center justify-center select-none active:scale-95 active:cursor-grabbing hover:scale-103 transition-transform duration-100 z-10"
                  >
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}

                {/* Draw targeting highlights. Dots for simple move, target rings for capturing targets */}
                {isTargetedMove && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-in fade-in duration-100">
                    {piece ? (
                      // Capture ring
                      <div className="w-[85%] h-[85%] rounded-full border-4 border-zinc-500/40 md:border-6" />
                    ) : (
                      // Destination empty dot
                      <div className="w-[28%] h-[28%] rounded-full bg-zinc-500/40 border border-zinc-600/30 shadow-sm" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Renders dynamic pawn promotion modal inside the chessboard container */}
      {renderPromotionOverlay()}
    </div>
  );
};
