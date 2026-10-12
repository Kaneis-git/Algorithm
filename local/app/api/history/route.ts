import { z } from "zod";
import { apiError, json, readBody } from "@/lib/api";
import { getStore } from "@/lib/db/store";
export const runtime = "nodejs";
export async function GET() {
  try { return json({ history: getStore().history() }); } catch (e) { return apiError(e); }
}
export async function DELETE(request: Request) {
  try { await readBody(request, z.object({ all: z.literal(true) }).strict()); getStore().clearHistory(); return json({ ok: true }); } catch (e) { return apiError(e); }
}
