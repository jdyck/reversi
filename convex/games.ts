import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";
import { v } from "convex/values";
import { initialBoard, moves, applyMove } from "../lib/game";

export const create = mutation({ args: { key: v.string() }, handler: async ({ db }, { key }) => {
  if (key.length < 30) throw new Error("Invalid player key");
  return await db.insert("games", { board: initialBoard(), turn: 1, blackKey: key });
} });
export const get = query({ args: { id: v.string() }, handler: async ({ db }, { id }) => {
  const gameId = db.normalizeId("games", id); const game = gameId ? await db.get(gameId) : null; if (!game) return null;
  return { board: game.board, turn: game.turn, joined: !!game.whiteKey, last: game.last ?? null, forfeited: game.forfeited ?? null };
} });
export const join = mutation({ args: { id: v.string(), key: v.string() }, handler: async ({ db }, { id, key }) => {
  const gameId = db.normalizeId("games", id); const game = gameId ? await db.get(gameId) : null; if (!game) throw new Error("Game not found");
  if (key.length < 30 || key === game.blackKey) throw new Error("Invalid player key");
  if (game.whiteKey && game.whiteKey !== key) throw new Error("This game already has two players");
  if (!game.whiteKey) await db.patch(game._id, { whiteKey: key });
} });
export const play = mutation({ args: { id: v.string(), key: v.string(), index: v.number() }, handler: async ({ db }, { id, key, index }) => {
  const gameId = db.normalizeId("games", id); const game = gameId ? await db.get(gameId) : null; if (!game) throw new Error("Game not found");
  if (!game.whiteKey) throw new Error("Waiting for your friend");
  if (game.forfeited) throw new Error("This game has ended");
  const player = key === game.blackKey ? 1 : key === game.whiteKey ? 2 : 0;
  if (!player || game.turn !== player) throw new Error("It is not your turn");
  const board = game.board as (0 | 1 | 2)[];
  const move = moves(board, player).find(m => m.index === index); if (!move) throw new Error("Invalid move");
  const next = applyMove(board, player, move), opponent = player === 1 ? 2 : 1;
  await db.patch(game._id, { board: next, turn: moves(next, opponent).length ? opponent : player, last: index });
} });

export const forfeit = mutation({ args: { id: v.string(), key: v.string() }, handler: async ({ db }, { id, key }) => {
  const gameId = db.normalizeId("games", id); const game = gameId ? await db.get(gameId) : null;
  if (!game) throw new Error("Game not found");
  const player = key === game.blackKey ? 1 : key === game.whiteKey ? 2 : 0;
  if (!player) throw new Error("Invalid player key");
  if (!game.whiteKey || game.forfeited || (!moves(game.board as (0 | 1 | 2)[], 1).length && !moves(game.board as (0 | 1 | 2)[], 2).length)) return;
  await db.patch(game._id, { forfeited: player });
} });
