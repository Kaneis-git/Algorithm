export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok", app: "knowledgehub-ai", mode: "live" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
