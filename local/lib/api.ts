import "server-only";
import { z } from "zod";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const querySchema = z.string().transform((s) => s.normalize("NFKC").trim().replace(/\s+/g, " ")).pipe(z.string().min(1).max(80));
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") throw new ApiError(403, "请从本站页面发起请求。");
}
export async function readBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  checkOrigin(request);
  if (!(request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json")) throw new ApiError(415, "请使用 JSON 请求。");
  if (Number(request.headers.get("content-length")) > 20000) throw new ApiError(413, "请求内容过大。");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "请求内容为空。");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 20000) { await reader.cancel(); throw new ApiError(413, "请求内容过大。"); }
    chunks.push(value);
  }
  try {
    const parsed = schema.safeParse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    if (!parsed.success) throw new Error();
    return parsed.data;
  } catch { throw new ApiError(400, "参数无效：主题需为 1–80 个字符，请检查请求内容。"); }
}
export function apiError(error: unknown) {
  return json({ error: error instanceof ApiError ? error.message : "操作失败，请检查本机服务配置后重试。" }, error instanceof ApiError ? error.status : 500);
}
