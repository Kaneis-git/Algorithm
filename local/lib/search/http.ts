import "server-only";
import { ServiceError } from "./errors";
import { requestTimeout } from "@/lib/config";

// Limit both response time and bytes, including a stalled response body.
export async function fetchJson(url: string, init: RequestInit = {}, timeout = requestTimeout()): Promise<unknown> {
  try {
    const response = await fetch(url, { ...init, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(timeout) });
    if (!response.ok) {
      await response.body?.cancel();
      if (response.status === 429 || response.status === 403) throw new ServiceError("rate_limit", "服务限流、额度不足或访问受限，请检查配置后重试。");
      if (response.status === 401) throw new ServiceError("unauthorized", "服务认证失败，请检查 API Key。");
      throw new ServiceError("network", "搜索服务暂时不可用，请稍后重试。");
    }
    const reader = response.body?.getReader();
    if (!reader) throw new ServiceError("invalid_response", "服务返回了空响应。");
    let length = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 2_000_000) {
        await reader.cancel();
        throw new ServiceError("invalid_response", "服务响应过大，请缩小搜索范围。");
      }
      chunks.push(value);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { throw new ServiceError("invalid_response", "服务返回格式无效。"); }
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)) throw new ServiceError("timeout", "搜索超时，请重试。");
    throw new ServiceError("network", "无法连接搜索服务，请检查网络或服务地址。");
  }
}
