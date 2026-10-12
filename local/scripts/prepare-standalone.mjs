import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const standalone = path.join(root, ".next", "standalone");

// Next's minimal server does not copy public/ and .next/static itself.
await mkdir(path.join(standalone, ".next"), { recursive: true });
await cp(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });
await cp(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), { recursive: true });

// Runtime secrets are supplied on the target host, never packed with a build.
for (const name of await readdir(standalone)) {
  if (name === ".env" || name.startsWith(".env.")) {
    await rm(path.join(standalone, name), { force: true });
  }
}
console.log("Standalone server and local assets are ready.");
