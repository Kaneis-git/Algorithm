export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok", app: "knowledgehub-ai", mode: "live", edition: "online" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
