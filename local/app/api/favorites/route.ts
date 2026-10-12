import { z } from "zod";
import { apiError, json, readBody } from "@/lib/api";
import { getStore } from "@/lib/db/store";
import { resultSchema } from "@/lib/search/schemas";
export const runtime = "nodejs";
export async function GET() {
  try { return json({ favorites: getStore().favorites() }); } catch (e) { return apiError(e); }
}
export async function POST(request: Request) {
  try { const { result } = await readBody(request, z.object({ result: resultSchema }).strict()); return json({ favorite: getStore().addFavorite(result) }); } catch (e) { return apiError(e); }
}
export async function DELETE(request: Request) {
  try { const { id } = await readBody(request, z.object({ id: z.string().regex(/^(github|web|ppt|video)_[a-f0-9]{24}$/) }).strict()); getStore().removeFavorite(id); return json({ ok: true }); } catch (e) { return apiError(e); }
}
