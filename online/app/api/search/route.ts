import { requireUserId } from "@/lib/auth";
import { z } from "zod";
import { apiError, json, querySchema, readBody } from "@/lib/api";
import { search } from "@/lib/search/service";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const { query, refresh } = await readBody(request, z.object({ query: querySchema, refresh: z.boolean().optional() }).strict());
    return json(await search(query, requireUserId(request), refresh));
  } catch (error) { return apiError(error); }
}
