'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { initialBoard, moves, applyMove, type Disc, type Board, type Move } from '../lib/game';
import OnlineGame from './online-game';
import BoardView from './board-view';

const other = (p: Disc): Disc => p === 1 ? 2 : 1;
const lessons = [
  { eyebrow: 'THE BASICS', title: 'A minute to learn. A lifetime to master.', text: 'Reversi is a game of turning the tables. Your goal is simple: finish with more discs of your color on the board.', tip: 'You play as black. Black always goes first.', label: 'Meet the board' },
  { eyebrow: 'THE BOARD', title: 'Four discs start the story.', text: 'Every game begins with four discs in the center. Players take turns placing one disc at a time on an empty square.', tip: 'The little dots show where black can play.', label: 'Find your move' },
  { eyebrow: 'MAKING A MOVE', title: 'Catch a disc between yours.', text: 'Place a black disc so that one or more white discs sit in a straight line between your new disc and another black disc.', tip: 'Try it: select the glowing square on the board.', label: 'Make your move' },
  { eyebrow: 'THE FLIP', title: 'And just like that, it’s yours.', text: 'Every white disc caught between your black discs flips to black. You can capture in any direction—even several directions at once.', tip: 'The highlighted disc just flipped from white to black.', label: 'See what happens' },
  { eyebrow: 'THE FINISH', title: 'Every move changes the picture.', text: 'If you can’t make a valid move, your turn is skipped. The game ends when neither player can move. Whoever has more discs wins!', tip: 'Corners are powerful: once yours, they can’t be flipped.', label: 'Ready to play' },
];


export default function Home() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [turn, setTurn] = useState<Disc>(1);
  const [mode, setMode] = useState<'learn' | 'play' | 'online'>('learn');
  const [step, setStep] = useState(0);
  const [opponent, setOpponent] = useState<'computer' | 'friend'>('computer');
  const [last, setLast] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [showNewGame, setShowNewGame] = useState(false);
  useEffect(() => { if (new URLSearchParams(window.location.search).has('game')) setMode('online'); }, []);
  const legal = useMemo(() => moves(board, turn), [board, turn]);
  const black = board.filter(x => x === 1).length, white = board.filter(x => x === 2).length;
  const gameOver = !moves(board, 1).length && !moves(board, 2).length;
  const reset = useCallback(() => { setBoard(initialBoard()); setTurn(1); setLast(null); setNotice(''); }, []);
  const play = useCallback((index: number) => {
    const move = moves(board, turn).find(m => m.index === index); if (!move) return;
    const next = applyMove(board, turn, move), nextPlayer = other(turn);
    setBoard(next); setLast(index);
    if (moves(next, nextPlayer).length) { setTurn(nextPlayer); setNotice(''); }
    else if (moves(next, turn).length) { setNotice(`${nextPlayer === 1 ? 'Black' : 'White'} has no valid moves, so their turn is skipped.`); }
    else setNotice('');
  }, [board, turn]);
  useEffect(() => {
    if (mode !== 'play' || opponent !== 'computer' || turn !== 2 || gameOver) return;
    const timer = window.setTimeout(() => { const options = moves(board, 2); if (options.length) { const ranked = [...options].sort((a,b) => (Number([0,7,56,63].includes(b.index)) * 100 + b.flips.length) - (Number([0,7,56,63].includes(a.index)) * 100 + a.flips.length)); play(ranked[0].index); } }, 550);
    return () => window.clearTimeout(timer);
  }, [mode, opponent, turn, board, gameOver, play]);
  useEffect(() => { if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') navigator.serviceWorker.register('/sw.js').catch(() => {}); }, []);
  const tutorialBoard = useMemo(() => step >= 3 ? applyMove(initialBoard(), 1, moves(initialBoard(), 1).find(m => m.index === 19)!) : initialBoard(), [step]);
  const startPlay = () => { reset(); setMode('play'); };
  const nextLesson = () => { if (step === 2) return; if (step === 4) startPlay(); else setStep(s => s + 1); };
  const tutorialLegal = step === 1 ? moves(initialBoard(), 1) : [];
  const status = gameOver ? (black === white ? 'It’s a draw!' : `${black > white ? 'Black' : 'White'} wins!`) : turn === 1 ? 'Black’s turn' : 'White’s turn';
  return <main className="app-shell">
    <header className="header"><a className="brand" href="#top" aria-label="Reversi home"><span className="brand-mark"><i/><i/></span><span>reversi</span></a><button className="rules-button" onClick={() => setShowRules(true)} aria-label="How to play">?</button></header>
    <div className="main-content" id="top">
      <div className="tabs" role="tablist" aria-label="Choose mode"><button role="tab" aria-selected={mode === 'learn'} className={mode === 'learn' ? 'active' : ''} disabled={mode === 'online'} onClick={() => setMode('learn')}>Learn</button><button role="tab" aria-selected={mode === 'play'} className={mode === 'play' ? 'active' : ''} disabled={mode === 'online'} onClick={() => { window.history.replaceState({}, '', '/'); setMode('play'); }}>Play</button></div>
      {mode === 'online' ? <OnlineGame onExit={() => { window.history.replaceState({}, '', '/'); setMode('play'); }} /> : <div className="workspace"><section className="game-panel" aria-label={mode === 'learn' ? 'Practice board' : 'Game board'}>
        <div className="board-area"><div className="board-heading"><div className={mode === 'play' && turn === 1 && !gameOver ? 'current' : ''}><span className="mini-disc black"/><span>Black</span><strong>{mode === 'learn' ? (step >= 3 ? 4 : 2) : black}</strong></div><span className="versus">vs</span><div className={mode === 'play' && turn === 2 && !gameOver ? 'current' : ''}><span className="mini-disc white"/><span>White</span><strong>{mode === 'learn' ? (step >= 3 ? 1 : 2) : white}</strong></div></div>
        {mode === 'learn' ? <BoardView board={tutorialBoard} legal={tutorialLegal} tutorialTarget={step === 2 ? 19 : undefined} highlighted={step === 3 ? [27] : []} last={step >= 3 ? 19 : null} onMove={step === 2 ? i => { if (i === 19) setStep(3); } : undefined}/> : <BoardView board={board} legal={gameOver || (opponent === 'computer' && turn === 2) ? [] : legal} last={last} onMove={gameOver || (opponent === 'computer' && turn === 2) ? undefined : play}/>}
        <div className="board-caption" aria-live="polite">{mode === 'learn' ? step === 2 ? 'Tap the glowing square to make your move.' : step === 3 ? 'The white disc flipped to black.' : step === 1 ? 'The dots show where you can play.' : 'Practice board' : notice || (gameOver ? status : `${status} · ${opponent === 'computer' && turn === 2 ? 'Thinking…' : 'Tap a dotted square'}`)}</div></div>
      </section>
      {mode === 'learn' ? <aside className="lesson-panel" aria-label="Reversi guide"><div className="lesson-meta"><span>LEARN TO PLAY</span><span>{step + 1} / 5</span></div><div className="progress" aria-label={`Lesson ${step + 1} of 5`}>{lessons.map((_, i) => <span key={i} className={i <= step ? 'filled' : ''}/>)}</div><h2>{lessons[step].title}</h2><p>{lessons[step].text}</p><p className="lesson-tip">{lessons[step].tip}</p><div className="lesson-actions"><button className="back-button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} aria-label="Previous lesson">←</button><button className="primary-button" onClick={nextLesson} disabled={step === 2}>{step === 4 ? 'Start playing' : step === 2 ? 'Your turn on the board' : 'Next'} <span>→</span></button><button className="skip-button" onClick={startPlay}>Skip</button></div></aside> : <div className="game-actions"><span>Playing {opponent === 'computer' ? 'the computer' : 'a friend'}</span><button onClick={() => setShowNewGame(true)}>New game</button></div>}</div>}
    </div>
    {showRules && <div className="modal-backdrop" onClick={() => setShowRules(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="rules-title" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowRules(false)} aria-label="Close">×</button><h2 id="rules-title">How to play</h2><ol><li><strong>Black goes first.</strong> Take turns placing a disc on an empty square.</li><li><strong>Sandwich to capture.</strong> Trap opposing discs between your new disc and another of yours in a straight line.</li><li><strong>Flip them over.</strong> Trapped discs turn to your color. You can capture in multiple directions.</li><li><strong>Finish the game.</strong> If you can’t move, you pass. When neither player can move, the player with more discs wins.</li></ol>{mode !== 'online' && <button className="primary-button" onClick={() => { setShowRules(false); setStep(0); setMode('learn'); }}>Try the visual guide <span>→</span></button>}</section></div>}
    {showNewGame && <div className="modal-backdrop" onClick={() => setShowNewGame(false)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-game-title" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowNewGame(false)} aria-label="Close">×</button><h2 id="new-game-title">New game</h2><p>Who would you like to play?</p><div className="opponent-options"><button onClick={() => { setOpponent('computer'); reset(); setShowNewGame(false); }}><strong>Computer</strong><span>Play solo →</span></button><button onClick={() => { setOpponent('friend'); reset(); setShowNewGame(false); }}><strong>A friend</strong><span>Pass and play →</span></button><button onClick={() => { setShowNewGame(false); setMode('online'); }}><strong>Friend online</strong><span>Share a link →</span></button></div></section></div>}
  </main>;
}
