import React, { useState } from 'react';
import { ChessPuzzle } from '../types';
import { CHESS_PUZZLES } from '../data/puzzles';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, HelpCircle, RefreshCw, Trophy, ArrowRight, BookOpen } from 'lucide-react';

interface PuzzleTabProps {
  activePuzzleId: string | null;
  onSelectPuzzle: (puzzle: ChessPuzzle) => void;
  puzzleProgress: 'unsolved' | 'solving' | 'solved' | 'failed';
  setPuzzleProgress: (state: 'unsolved' | 'solving' | 'solved' | 'failed') => void;
  currentPuzzleStep: number;
  resetPuzzle: () => void;
}

export const PuzzleTab: React.FC<PuzzleTabProps> = ({
  activePuzzleId,
  onSelectPuzzle,
  puzzleProgress,
  setPuzzleProgress,
  currentPuzzleStep,
  resetPuzzle,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);
  const activePuzzle = CHESS_PUZZLES.find(p => p.id === activePuzzleId) || null;

  const handlePuzzleSelect = (puzzle: ChessPuzzle) => {
    setShowHint(false);
    onSelectPuzzle(puzzle);
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans select-none">
      {/* Active Puzzle Controller Board */}
      {activePuzzle ? (
        <Card className="border-neutral-200/80 dark:border-neutral-800/80 shadow-sm overflow-hidden">
          <div className="bg-primary/5 dark:bg-primary/10 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-sans text-xs font-semibold uppercase tracking-wider text-primary">
                Active Tactical Lesson
              </span>
            </div>
            <Badge variant={puzzleProgress === 'solved' ? 'default' : 'secondary'} className="text-[10px] font-bold">
              {puzzleProgress === 'solved' ? (
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400 fill-amber-400" /> Solved
                </span>
              ) : puzzleProgress === 'failed' ? (
                'Wrong move'
              ) : puzzleProgress === 'solving' ? (
                'In progress...'
              ) : (
                'Not started'
              )}
            </Badge>
          </div>

          <CardContent className="p-4 flex flex-col gap-4">
            <div>
              <h3 className="font-sans font-bold text-neutral-900 dark:text-neutral-50 text-md tracking-tight">
                {activePuzzle.title}
              </h3>
              <p className="font-sans text-xs text-neutral-500 mt-1 dark:text-neutral-400">
                {activePuzzle.description}
              </p>
            </div>

            {/* Instruction Banner */}
            <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/60 rounded-xl text-xs flex flex-col gap-1.5 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 font-medium">To Play:</span>
                <span className="font-bold flex items-center gap-1">
                  {activePuzzle.sideToPlay === 'w' ? (
                    <Badge className="bg-white text-neutral-800 hover:bg-white/80 border border-neutral-200 size-mini shadow-sm">
                      White
                    </Badge>
                  ) : (
                    <Badge className="bg-neutral-950 text-white hover:bg-neutral-950/80 border border-neutral-900 size-mini shadow-sm">
                      Black
                    </Badge>
                  )}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-[11px] leading-relaxed">
                Analyze the FEN structure on the board and drag the piece to complete the solution!
              </p>
            </div>

            {/* Hints Box */}
            {showHint && (
              <div className="p-3 bg-amber-500/5 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-xl text-[11px] leading-relaxed animate-in slide-in-from-top-2 duration-150 shadow-sm flex gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Grandmaster Hint:</span>
                  {activePuzzle.hint}
                </div>
              </div>
            )}

            {/* Controller Action buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="text-xs h-9 px-3 rounded-lg border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                {showHint ? 'Hide Hint' : 'Request Hint'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetPuzzle}
                className="text-xs h-9 px-3 rounded-lg border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-medium cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reset Board
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectPuzzle(CHESS_PUZZLES[0]); // default clear or close
                  // We can toggle off easily
                }}
                className="text-xs h-9 px-3 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 ml-auto cursor-pointer"
              >
                Exit Puzzle
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Available Puzzle Selection Bank */}
      <h3 className="font-sans font-semibold text-neutral-450 dark:text-neutral-400 tracking-wider text-[10px] uppercase. py-1 select-none">
        Tactics Database
      </h3>

      <div className="grid grid-cols-1 gap-2.5">
        {CHESS_PUZZLES.map((puzzle) => {
          const isSelected = activePuzzleId === puzzle.id;
          return (
            <div
              key={puzzle.id}
              onClick={() => handlePuzzleSelect(puzzle)}
              className={`group flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer hover:shadow-md hover:scale-[1.01] hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150 ${
                isSelected
                  ? 'bg-neutral-50 dark:bg-neutral-900/60 border-neutral-300 dark:border-neutral-700 ring-2 ring-primary/10'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800/80 shadow-sm'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-xs text-neutral-800 dark:text-neutral-200 group-hover:text-primary transition-colors">
                    {puzzle.title}
                  </span>
                  <Badge className="text-[9px] px-1.5 py-0.2" variant="outline">
                    {puzzle.sideToPlay === 'w' ? 'White to Move' : 'Black to Move'}
                  </Badge>
                </div>
                <p className="font-sans text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 line-clamp-1 max-w-[240px]">
                  {puzzle.description}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {isSelected ? (
                  <Badge className="bg-primary hover:bg-primary font-bold text-[9px]">Active</Badge>
                ) : (
                  <div className="p-1 px-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 text-[10px] font-sans font-semibold text-neutral-400 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800/60 hover:text-neutral-600 dark:hover:text-neutral-300 flex items-center gap-1 transition-colors">
                    Try <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
