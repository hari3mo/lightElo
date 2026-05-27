export interface ChessOpening {
  name: string;
  description: string;
  moves: string[];
}

export const POPULAR_OPENINGS: ChessOpening[] = [
  {
    name: "Ruy Lopez",
    description: "One of the oldest, deepest, and most prestigious chess openings. White develops the bishop to b5 to pressure the knight defending Black's central pawn on e5.",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5"]
  },
  {
    name: "Italian Game",
    description: "A classical and aggressive opening. White develops the bishop to c4, aiming directly at Black's weakest spot: the f7 pawn close to the king.",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4"]
  },
  {
    name: "Scotch Game",
    description: "An energetic and straightforward opening. White immediately strikes the center with d4, inviting tactical trades and open play.",
    moves: ["e2e4", "e7e5", "g1f3", "b8c6", "d2d4"]
  },
  {
    name: "Petrov's Defense",
    description: "A highly solid, symmetrical counter-attack. Black chooses to counter-attack White's e4 pawn instead of defending their own e5 pawn.",
    moves: ["e2e4", "e7e5", "g1f3", "g8f6"]
  },
  {
    name: "Philidor Defense",
    description: "A solid and cautious opening. Black reinforces the e5 pawn with d6, maintaining a safe, though somewhat passive and cramped posture.",
    moves: ["e2e4", "e7e5", "g1f3", "d7d6"]
  },
  {
    name: "Sicilian Defense",
    description: "The most popular, sharpest, and highest-scoring response to e4. By fighting for d4 with the c-pawn, Black initiates a complex asymmetrical battle.",
    moves: ["e2e4", "c7c5"]
  },
  {
    name: "French Defense",
    description: "A resilient, structural defense. Black blocks the light-square bishop but secures a strong pawn chain, preparing to blow up White's center later.",
    moves: ["e2e4", "e7e6"]
  },
  {
    name: "Caro-Kann Defense",
    description: "An exceptionally solid and safe defense. Black prepares to push d5 with support, aiming for clean pawn structures and a favorable endgame.",
    moves: ["e2e4", "c7c6"]
  },
  {
    name: "Modern Defense",
    description: "A hypermodern defense. Black allows White to occupy the center with pawns, planning to attack and piece-pressure it from the flanks.",
    moves: ["e2e4", "g7g6"]
  },
  {
    name: "Pirc Defense",
    description: "A hypermodern counterpart to the King's Indian. Black delays central pawn moves in favor of quick development, looking to counterpunch.",
    moves: ["e2e4", "d7d6"]
  },
  {
    name: "Alekhine's Defense",
    description: "A provocative, psychological defense. Black lures White's pawns forward into over-expansion, hoping to make them targets later.",
    moves: ["e2e4", "g8f6"]
  },
  {
    name: "Queen's Gambit Declined",
    description: "The height of classical sound chess. Black declines the gambit pawn at c4 to construct an unshakeable central wedge.",
    moves: ["d2d4", "d7d5", "c2c4", "e7e6"]
  },
  {
    name: "Slav Defense",
    description: "A brilliant, rock-solid response to the Queen's Gambit. Black supports the d5 pawn with c6, keeping the light-square bishop free to develop.",
    moves: ["d2d4", "d7d5", "c2c4", "c7c6"]
  },
  {
    name: "Queen's Gambit",
    description: "White offers a side pawn to lure Black's d-pawn away, aiming to seize total central control and open development lines.",
    moves: ["d2d4", "d7d5", "c2c4"]
  },
  {
    name: "King's Indian Defense",
    description: "A highly dynamic hypermodern defense. Black gives up immediate center space, intending a powerful kingside pawn-storm in the middlegame.",
    moves: ["d2d4", "g8f6", "c2c4", "g7g6"]
  },
  {
    name: "Nimzo-Indian Defense",
    description: "A highly respected and flexible defense. Black pins White's knight on c3 to clamp down on the vital e4 square.",
    moves: ["d2d4", "g8f6", "c2c4", "e7e6"]
  },
  {
    name: "Dutch Defense",
    description: "An aggressive flank response. Black fights for e4 control using the f-pawn, creating unbalanced, high-stakes tactical structures.",
    moves: ["d2d4", "f7f5"]
  },
  {
    name: "Queen's Pawn Game",
    description: "A solid, strategic start aiming for steady development, strong squares control, and robust central protection.",
    moves: ["d2d4", "d7d5"]
  },
  {
    name: "Indian Defense",
    description: "A hypermodern response to the queen's pawn. Black controls e4 with pieces rather than pawns, keeping layout options flexible.",
    moves: ["d2d4", "g8f6"]
  },
  {
    name: "King's Pawn Game",
    description: "The classical open starting move. White stakes an immediate claim in the center, opens up the queen and light-squared bishop.",
    moves: ["e2e4", "e7e5"]
  },
  {
    name: "Reti Opening",
    description: "A flexible hypermodern flank opening. White develops the knight first, keeping black guessing about vertical pawn commitments.",
    moves: ["g1f3", "d7d5"]
  },
  {
    name: "English Opening",
    description: "White stakes a claim in the center with a flank pawn (c4), controlling the critical d5 square and steering games into positional depth.",
    moves: ["c2c4"]
  },
  {
    name: "Bird's Opening",
    description: "An aggressive flank choice. White pushes f4 immediately to pressure e5 and build a kingside presence.",
    moves: ["f2f4"]
  },
  {
    name: "Nimzowitsch-Larsen Attack",
    description: "An elegant flank system. White prepares to play b3 and fianchetto the dark-square bishop to control the diagonal e4-a8.",
    moves: ["b3"]
  },
  {
    name: "King's Pawn Game (1. e4)",
    description: "The most popular opening move in chess. White stakes a claim in the center and prepares quick bishop and queen activation.",
    moves: ["e2e4"]
  },
  {
    name: "Queen's Pawn Game (1. d4)",
    description: "A highly strategic opening move. White controls the e5 square, preparing for structured, positional, and queen-side campaigns.",
    moves: ["d2d4"]
  }
];

/**
 * Detect the deepest matching opening from the current game's move coordinates history.
 */
export function detectOpening(historyMoves: { from: string; to: string }[]): { name: string; description: string } | null {
  if (historyMoves.length === 0) return null;

  const currentCoords = historyMoves.map(m => `${m.from}${m.to}`);
  
  let deepestMatch: ChessOpening | null = null;
  let maxMatchedMoves = 0;

  for (const opening of POPULAR_OPENINGS) {
    // Check if the opening moves are a prefix of the played history
    if (opening.moves.length <= currentCoords.length) {
      let isMatch = true;
      for (let i = 0; i < opening.moves.length; i++) {
        if (opening.moves[i] !== currentCoords[i]) {
          isMatch = false;
          break;
        }
      }
      
      if (isMatch && opening.moves.length > maxMatchedMoves) {
        deepestMatch = opening;
        maxMatchedMoves = opening.moves.length;
      }
    }
  }

  return deepestMatch ? { name: deepestMatch.name, description: deepestMatch.description } : null;
}
