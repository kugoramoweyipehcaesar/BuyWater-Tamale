import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/**
 * Single Prisma client. On Supabase pooler use:
 * DATABASE_URL=...pooler...:6543/postgres?pgbouncer=true&connection_limit=1
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Simple in-memory TTL cache for hot public reads (survives warm instances). */
const mem = globalForPrisma.__bwCache || new Map();
globalForPrisma.__bwCache = mem;

export function cacheGet(key) {
  const row = mem.get(key);
  if (!row) return null;
  if (Date.now() > row.exp) {
    mem.delete(key);
    return null;
  }
  return row.val;
}

export function cacheSet(key, val, ttlMs = 60_000) {
  mem.set(key, { val, exp: Date.now() + ttlMs });
  return val;
}

export function cacheDel(prefix) {
  for (const k of mem.keys()) {
    if (k === prefix || k.startsWith(prefix)) mem.delete(k);
  }
}
