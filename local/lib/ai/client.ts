import "server-only";
import { z } from "zod";
import { endpoint, numberSetting } from "@/lib/config";
import { fetchJson } from "@/lib/search/http";
import { ServiceError } from "@/lib/search/errors";

const responseSchema = z.object({ choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }), finish_reason: z.string().nullish() })).min(1) });
export function aiConfig() {
  if (process.env.AI_ENABLED === "false") throw new ServiceError("disabled", "AI 功能已关闭，仍可搜索和收藏资源。");
  const base = endpoint(process.env.AI_BASE_URL || "https://api.deepseek.com");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(base).hostname);
  const key = process.env.AI_API_KEY || "";
  if (!key && !(local && process.env.AI_ALLOW_NO_KEY === "true")) throw new ServiceError("unconfigured", "配置 AI_API_KEY 后可使用 AI 扩展与总结；当前使用规则扩展。");
  return { base, key, model: process.env.AI_MODEL || "deepseek-flash" };
}
export async function chatJson<T>(system: string, input: unknown, schema: z.ZodType<T>, maxTokens: number): Promise<T> {
  const config = aiConfig();
  const extra = new URL(config.base).hostname === "api.deepseek.com" ? { thinking: { type: "disabled" } } : {};
  const raw = await fetchJson(`${config.base}/chat/completions`, {
    method: "POST", headers: { "Content-Type": "application/json", ...(config.key ? { Authorization: `Bearer ${config.key}` } : {}) },
    body: JSON.stringify({ model: config.model, messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify(input) }], response_format: { type: "json_object" }, max_tokens: maxTokens, stream: false, ...extra }),
  }, numberSetting("AI_TIMEOUT_MS", 20000, 500, 45000));
  const response = responseSchema.safeParse(raw);
  if (!response.success) throw new ServiceError("invalid_response", "AI 服务响应格式无效，搜索结果仍然可用。");
  const choice = response.data.choices[0];
  if (choice.finish_reason && choice.finish_reason !== "stop") throw new ServiceError("invalid_response", "AI 输出未完成，搜索结果仍然可用。");
  try {
    const content = (choice.message.content || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return schema.parse(JSON.parse(content));
  } catch { throw new ServiceError("invalid_response", "AI 输出未通过结构校验，搜索结果仍然可用。"); }
}
