import mongoose from "mongoose";
import type { Connection } from "mongoose";
import { getEnv } from "@/lib/env";

interface Cached {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var __mongooseCache: Cached | undefined;
}

const cache: Cached = globalThis.__mongooseCache ?? {
  conn: null,
  promise: null,
};
globalThis.__mongooseCache = cache;

export async function connectDB(): Promise<Connection> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    const { MONGODB_URI } = getEnv();
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .then((m) => m.connection);
  }
  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
  return cache.conn;
}
