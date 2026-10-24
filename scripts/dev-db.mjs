/**
 * Boots an ephemeral local MongoDB (mongodb-memory-server) and prints the
 * connection URI. Run: npm run db:dev
 * Then: MONGODB_URI=<printed uri> npm run seed  (or export it for `next dev`).
 */

import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create({
  instance: { port: 27017, dbName: "jonosheba" },
});

console.log(`MongoDB running at: ${mongod.getUri()}`);
console.log("Press Ctrl+C to stop.");

async function shutdown() {
  await mongod.stop();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
