"use client";
import { useEffect, useState } from "react";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import BoardView from "./board-view";
import { QRCodeSVG } from "qrcode.react";
import { moves, type Board } from "../lib/game";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = url ? new ConvexReactClient(url) : null;
const createRef = makeFunctionReference<"mutation", {key:string}, string>("games:create");
const joinRef = makeFunctionReference<"mutation", {id:string,key:string}, null>("games:join");
const playRef = makeFunctionReference<"mutation", {id:string,key:string,index:number}, null>("games:play");
const forfeitRef = makeFunctionReference<"mutation", {id:string,key:string}, null>("games:forfeit");
type Game = {board: Board; turn: number; joined: boolean; last: number | null; forfeited: number | null};
const getRef = makeFunctionReference<"query", {id:string}, Game | null>("games:get");

export default function OnlineGame({ onExit }: { onExit: () => void }) {
  if (!client) return <div className="online-empty"><h2>Play a friend online</h2><p>Online games need a Convex deployment. Follow the setup in the project README to get started.</p><button className="primary-button" onClick={onExit}>Back to game</button></div>;
  return <ConvexProvider client={client}><OnlineRoom onExit={onExit}/></ConvexProvider>;
}
function OnlineRoom({onExit}: {onExit: () => void}) {
  const [id, setId] = useState<string | null>(null), [key, setKey] = useState<string | null>(null);
  const [role, setRole] = useState<"black" | "white" | null>(null), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [copied, setCopied] = useState(false), [origin, setOrigin] = useState('');
  const create = useMutation(createRef), join = useMutation(joinRef), play = useMutation(playRef), forfeit = useMutation(forfeitRef);
  const game = useQuery(getRef, id ? {id} : "skip");
  useEffect(() => { setOrigin(window.location.origin); const room = new URLSearchParams(window.location.search).get('game'); if (room) { setId(room); const saved = localStorage.getItem(`reversi-game-${room}`); if (saved) { try { const player = JSON.parse(saved); setKey(player.key); setRole(player.role); } catch {} } } setReady(true); }, []);
  const save = (room: string, playerKey: string, playerRole: "black" | "white") => { localStorage.setItem(`reversi-game-${room}`, JSON.stringify({key: playerKey, role: playerRole})); setId(room); setKey(playerKey); setRole(playerRole); window.history.replaceState({}, '', `/?game=${encodeURIComponent(room)}`); };
  const start = async () => { setBusy(true); setError(''); try { const playerKey = crypto.randomUUID(); const room = await create({key:playerKey}); save(room, playerKey, 'black'); } catch { setError('Could not create the game. Check your connection and try again.'); } finally { setBusy(false); } };
  const joinGame = async () => { if (!id) return; setBusy(true); setError(''); try { const playerKey = crypto.randomUUID(); await join({id,key:playerKey}); save(id, playerKey, 'white'); } catch { setError('Could not join. The game may already have two players.'); } finally { setBusy(false); } };
  const makeMove = async (index: number) => { if (!id || !key || busy) return; setBusy(true); setError(''); try { await play({id,key,index}); } catch { setError('That move could not be made. Please try again.'); } finally { setBusy(false); } };
  const inviteUrl = id && origin ? `${origin}/?game=${encodeURIComponent(id)}` : '';
  const copy = async () => { try { await navigator.clipboard.writeText(inviteUrl); setCopied(true); } catch { setError('Copy the game link from your browser address bar.'); } };
  const leave = async () => { if (!id || !key || !game?.joined || game.forfeited) { onExit(); return; } setBusy(true); setError(''); try { await forfeit({id, key}); onExit(); } catch { setError('Could not leave the game. Please check your connection and try again.'); setBusy(false); } };
  if (!ready) return null;
  if (!id) return <div className="online-empty"><h2>Play a friend online</h2><p>Start a game and send the link to a friend. You’ll play black.</p>{error && <p role="alert">{error}</p>}<button className="primary-button" disabled={busy} onClick={start}>{busy ? 'Starting…' : 'Create game'} <span>→</span></button><button className="text-button" onClick={onExit}>Back</button></div>;
  if (game === undefined) return <div className="online-empty"><p>Loading game…</p><button className="text-button" onClick={onExit}>Back</button></div>;
  if (!game) return <div className="online-empty"><h2>Game not found</h2><p>Check the invitation link and try again.</p><button className="text-button" onClick={onExit}>Back</button></div>;
  if (!role) return <div className="online-empty"><h2>You’re invited</h2><p>{game.joined ? 'This game already has two players.' : 'Join your friend as white.'}</p>{error && <p role="alert">{error}</p>}{!game.joined && <button className="primary-button" disabled={busy} onClick={joinGame}>Join game <span>→</span></button>}<button className="text-button" onClick={onExit}>Back</button></div>;
  const black = game.board.filter(x => x === 1).length, white = game.board.filter(x => x === 2).length;
  const over = !!game.forfeited || (!moves(game.board, 1).length && !moves(game.board, 2).length), mine = role === 'black' ? 1 : 2;
  const legal = game.joined && !over && game.turn === mine && !busy ? moves(game.board, mine) : [];
  const status = game.forfeited ? (game.forfeited === mine ? 'You forfeited the game.' : 'Your friend left and forfeited the game.') : !game.joined ? 'Waiting for your friend to join' : over ? black === white ? 'It’s a draw!' : `${black > white ? 'Black' : 'White'} wins!` : game.turn === mine ? 'Your turn · Tap a dotted square' : 'Your friend’s turn';
  return <div className="workspace"><section className="game-panel"><div className="board-area"><div className="board-heading"><div className={game.turn === 1 && !over ? 'current' : ''}><span className="mini-disc black"/><span>Black</span><strong>{black}</strong></div><span className="versus">vs</span><div className={game.turn === 2 && !over ? 'current' : ''}><span className="mini-disc white"/><span>White</span><strong>{white}</strong></div></div><BoardView board={game.board} legal={legal} last={game.last} onMove={legal.length ? makeMove : undefined}/><div className="board-caption" aria-live="polite">{status}</div></div></section><div className="game-actions online-actions"><span>You’re {role} · Online game</span>{!game.joined && inviteUrl && <div className="invite-qr"><QRCodeSVG value={inviteUrl} size={180} marginSize={4} title="Scan to join this Reversi game"/><p>Ask your friend to scan this code to join.</p>{(origin.includes('://localhost') || origin.includes('://127.0.0.1')) && <p>For another phone to connect, open this game using an address it can reach.</p>}</div>}{!game.joined && <button onClick={copy}>{copied ? 'Link copied' : 'Copy invite link'}</button>}<button disabled={busy} onClick={leave}>Leave</button>{error && <p role="alert">{error}</p>}</div></div>;
}
