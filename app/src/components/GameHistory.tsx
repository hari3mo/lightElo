import React, { useRef, useEffect } from 'react';
import { GameMove } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, RotateCcw } from 'lucide-react';

interface GameHistoryProps {
  history: GameMove[];
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  activeColor: 'w' | 'b';
  isGameOver: boolean;
  gameStatus: string;
}

export const GameHistory: React.FC<GameHistoryProps> = ({
  history,
  onUndo,
  onReset,
  canUndo,
  activeColor,
  isGameOver,
  gameStatus,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group moves in white/black turns array pairing
  const getMovePairs = () => {
    const pairs: { index: number; w: string; b?: string }[] = [];
    for (let i = 0; i < history.length; i += 2) {
      pairs.push({
        index: Math.floor(i / 2) + 1,
        w: history[i].san,
        b: history[i + 1] ? history[i + 1].san : undefined,
      });
    }
    return pairs;
  };

  const movePairs = getMovePairs();

  // Scroll to bottom on updates
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [history]);

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 p-4 shadow-sm">
      {/* Header Status bar */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-3 mb-3 shrink-0 select-none">
        <h3 className="font-sans font-semibold tracking-tight text-neutral-850 dark:text-neutral-50 text-sm">
          Match Commentary
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            id="undo-btn"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer text-neutral-600 dark:text-neutral-400 transition-colors"
            title="Undo Last Move"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Turn indicator banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/60 rounded-xl mb-3 shrink-0 select-none">
        <div className="relative flex h-2 w-2">
          {(!isGameOver) && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isGameOver ? 'bg-neutral-400' : 'bg-emerald-500'}`} />
        </div>
        <p className="font-sans text-[11px] font-semibold tracking-wide uppercase text-neutral-400 dark:text-neutral-500">
          State:
        </p>
        <span className="font-sans text-xs font-medium text-neutral-800 dark:text-neutral-200">
          {gameStatus}
        </span>
      </div>

      {/* Ledger Moves Records */}
      <div ref={scrollRef} className="flex-grow min-h-[140px] relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-100/60 dark:border-neutral-800/20 p-2 rounded-xl mb-4 shadow-inner">
        <ScrollArea className="h-full w-full">
          {movePairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 h-full min-h-[120px] select-none">
              <Play className="w-6 h-6 text-neutral-300 dark:text-neutral-700 mb-2 animate-pulse" />
              <p className="font-sans text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                Waiting for first move...
              </p>
              <p className="font-sans text-[10px] text-neutral-400/80 max-w-[160px] mt-1 line-clamp-2">
                Drag a white piece or select a starting coordinate.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 divide-y divide-neutral-100/60 dark:divide-neutral-850/40 font-mono text-xs text-neutral-700 dark:text-neutral-300">
              {movePairs.map((pair) => (
                <div key={pair.index} className="grid grid-cols-12 py-2 px-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rounded transition-colors group">
                  {/* Turn Count index */}
                  <span className="col-span-2 text-neutral-400/80 font-bold group-hover:text-neutral-400">
                    {pair.index}.
                  </span>
                  {/* White move */}
                  <span className="col-span-5 font-semibold text-neutral-800 dark:text-neutral-100 italic">
                    {pair.w}
                  </span>
                  {/* Black move */}
                  <span className="col-span-5 text-neutral-500 dark:text-neutral-400 italic">
                    {pair.b || '...'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Reset matches action area */}
      <button
        id="reset-btn"
        onClick={onReset}
        className="w-full py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-100 font-sans font-medium text-xs rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none duration-100"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Force Reset Game
      </button>
    </div>
  );
};
