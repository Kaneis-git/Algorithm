import "server-only";
import { ServiceError } from "@/lib/search/errors";

export function endpoint(value: string): string {
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash || (url.protocol !== "https:" && !(local && url.protocol === "http:"))) throw new Error();
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new ServiceError("config", "服务地址配置无效，请检查 .env.local。");
  }
}

export function numberSetting(name: string, fallback: number, min: number, max: number) {
  const value = Number(process.env[name] || fallback);
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
}

export const requestTimeout = () => numberSetting("SEARCH_TIMEOUT_MS", 12000, 100, 30000);
export const resultLimit = () => numberSetting("SEARCH_RESULT_LIMIT", 8, 1, 20);
