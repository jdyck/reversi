export type Disc = 0 | 1 | 2;
export type Board = Disc[];
export type Move = { index: number; flips: number[] };
const directions = [-1, 0, 1].flatMap(y => [-1, 0, 1].map(x => [y, x])).filter(([y,x]) => y || x);
export const initialBoard = (): Board => { const b = Array<Disc>(64).fill(0); b[27] = 2; b[28] = 1; b[35] = 1; b[36] = 2; return b; };
const other = (p: Disc): Disc => p === 1 ? 2 : 1;
export function moves(board: Board, player: Disc): Move[] {
  const result: Move[] = [];
  board.forEach((cell, index) => {
    if (cell) return;
    const row = Math.floor(index / 8), col = index % 8, flips: number[] = [];
    directions.forEach(([dy, dx]) => {
      let y = row + dy, x = col + dx; const line: number[] = [];
      while (y >= 0 && y < 8 && x >= 0 && x < 8 && board[y * 8 + x] === other(player)) { line.push(y * 8 + x); y += dy; x += dx; }
      if (line.length && y >= 0 && y < 8 && x >= 0 && x < 8 && board[y * 8 + x] === player) flips.push(...line);
    });
    if (flips.length) result.push({ index, flips });
  });
  return result;
}
export function applyMove(board: Board, player: Disc, move: Move): Board { const next = [...board]; next[move.index] = player; move.flips.forEach(i => next[i] = player); return next; }
