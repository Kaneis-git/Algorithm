import { requireUserId } from "@/lib/auth";
import { z } from "zod";
import { apiError, json, readBody } from "@/lib/api";
import { getStore } from "@/lib/db/index";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try { return json({ history: await getStore(requireUserId(request)).history() }); } catch (e) { return apiError(e); }
}
export async function DELETE(request: Request) {
  try { await readBody(request, z.object({ all: z.literal(true) }).strict()); await getStore(requireUserId(request)).clearHistory(); return json({ ok: true }); } catch (e) { return apiError(e); }
}
