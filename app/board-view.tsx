'use client';
import type { Board, Move } from '../lib/game';
export default function BoardView({ board, legal = [], onMove, last, highlighted = [], tutorialTarget }: { board: Board; legal?: Move[]; onMove?: (index: number) => void; last?: number | null; highlighted?: number[]; tutorialTarget?: number }) {
  return <div className="board-wrap"><div className="board-row"><div className="board" role="grid" aria-label="Reversi board">{board.map((disc, i) => {
    const isLegal = legal.some(m => m.index === i), target = tutorialTarget === i;
    return <button key={i} role="gridcell" className={`square ${target ? 'target' : ''} ${highlighted.includes(i) ? 'highlighted' : ''}`} onClick={() => onMove?.(i)} disabled={!onMove || (!isLegal && !target)} aria-label={`${'ABCDEFGH'[i % 8]}${Math.floor(i / 8) + 1}, ${disc === 1 ? 'black disc' : disc === 2 ? 'white disc' : isLegal || target ? 'valid move' : 'empty'}`}>
      {disc ? <span className={`disc ${disc === 1 ? 'black' : 'white'}`}>{last === i && <span className="last-dot" />}</span> : (isLegal || target) ? <span className="legal-dot" /> : null}
    </button>;
  })}</div></div></div>;
}

