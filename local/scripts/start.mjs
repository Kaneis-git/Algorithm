import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { access } from "node:fs/promises";

const server = new URL("../.next/standalone/server.js", import.meta.url);
try {
  await access(server);
} catch {
  console.error("请先运行 npm run build，再运行 npm start。");
  process.exit(1);
}

// HOSTNAME may be inherited from Docker/Linux as a machine name.
// Use an explicit application setting for predictable cross-platform binding.
process.env.HOSTNAME = process.env.APP_HOST || "127.0.0.1";
process.env.PORT ||= "3000";
process.env.NODE_ENV = "production";
const root = fileURLToPath(new URL("../", import.meta.url));
process.env.DATABASE_PATH = resolve(root, process.env.DATABASE_PATH || "data/knowledgehub.db");
await import(server.href);
