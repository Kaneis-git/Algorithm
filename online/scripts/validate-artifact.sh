#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

worker="${SITES_PROJECT_ROOT}/dist/server/index.js"
hosting="${SITES_PROJECT_ROOT}/dist/.openai/hosting.json"

[[ -f "${worker}" ]] || {
  echo "Missing Sites Worker entry: dist/server/index.js" >&2
  exit 66
}
[[ -f "${hosting}" ]] || {
  echo "Missing packaged Sites manifest: dist/.openai/hosting.json" >&2
  exit 66
}

node --input-type=module - "${worker}" "${hosting}" <<'NODE'
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
const [workerPath, hostingPath] = process.argv.slice(2);
const hosting = JSON.parse(await readFile(hostingPath, "utf8"));
if (hosting.d1 !== "DB") throw new Error("The online edition requires the DB binding.");
if (!(await readFile(workerPath, "utf8")).length) throw new Error("Empty Worker entrypoint.");
const migrations = join(dirname(hostingPath), "drizzle");
const journal = JSON.parse(await readFile(join(migrations, "meta/_journal.json"), "utf8"));
if (!journal.entries.length) throw new Error("Missing packaged D1 migrations.");
for (const entry of journal.entries) {
  await readFile(join(migrations, `${entry.tag}.sql`), "utf8");
}
NODE

# Cloudflare-only modules cannot be imported by Node's ESM loader. Validate with
# Wrangler's deployment packager without uploading or starting a preview server.
node "${SITES_PROJECT_ROOT}/node_modules/wrangler/bin/wrangler.js" deploy \
  --dry-run \
  --config "${SITES_PROJECT_ROOT}/dist/server/wrangler.json" \
  --outdir "${SITES_PROJECT_ROOT}/.sites-runtime/validated-worker"

echo "Validated Sites Worker package, DB binding and packaged migrations."
