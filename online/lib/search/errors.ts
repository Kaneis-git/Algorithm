export class ServiceError extends Error {
  constructor(public code: "unconfigured" | "disabled" | "timeout" | "unauthorized" | "rate_limit" | "invalid_response" | "network" | "config", message: string) {
    super(message);
  }
}

export function publicError(error: unknown): string {
  return error instanceof ServiceError ? error.message : "服务暂时不可用，请稍后重试。";
}
