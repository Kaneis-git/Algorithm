import { rm } from "node:fs/promises";
// This directory is entirely generated. Remove its runtime route cache before
// rebuilding so a previous site's prerendered pages cannot survive an upgrade.
await rm(new URL("../.next/standalone/", import.meta.url), { recursive: true, force: true });
