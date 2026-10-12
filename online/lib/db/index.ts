import "server-only";
import { env } from "cloudflare:workers";
import { Store } from "./store";
export function getStore(userId: string) {
  if (!env.DB) throw new Error("D1 database is unavailable");
  return new Store(env.DB, userId);
}
