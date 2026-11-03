import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({ games: defineTable({ board: v.array(v.number()), turn: v.number(), blackKey: v.string(), whiteKey: v.optional(v.string()), last: v.optional(v.number()), forfeited: v.optional(v.number()) }) });
