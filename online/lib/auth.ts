import "server-only";
import { ApiError } from "./api";
export function requireUserId(request: Request) {
  // Sites dispatch authenticates visitors and injects this stable Site-scoped ID.
  // Never accept a user ID from query parameters or JSON request bodies.
  const userId = request.headers.get("oai-authenticated-user-id");
  if (!userId) throw new ApiError(401, "请通过本站登录入口登录后使用。");
  return userId;
}
