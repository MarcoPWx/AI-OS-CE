import { http, HttpResponse, delay, passthrough } from "msw";

export const MOCK_ROUTES = [
  { method: "GET", path: "/api/ping", note: "Ping health" },
  { method: "POST", path: "/api/echo", note: "Echo back body" },
];

function readDelay(req: Request) {
  const h = req.headers as any as Headers;
  const ms = Number(h.get("x-mock-delay") || "0");
  return Number.isFinite(ms) ? ms : 0;
}
function readErrorRate(req: Request) {
  const h = req.headers as any as Headers;
  const rate = Number(h.get("x-mock-error-rate") || "0");
  return rate >= 0 && rate <= 1 ? rate : 0;
}
function maybeFail(rate: number) {
  return Math.random() < rate;
}

export const handlers = [
  http.all("*", async ({ request }) => {
    const disabled =
      (request.headers as any as Headers).get("x-mock-disable") === "1";
    if (disabled) return passthrough();
    return undefined as any;
  }),
  http.get("/api/ping", async ({ request }) => {
    const d = readDelay(request);
    const er = readErrorRate(request);
    if (d) await delay(d);
    if (maybeFail(er))
      return HttpResponse.json(
        { error: "Injected error (ping)" },
        { status: 429 },
      );
    return HttpResponse.json({ ok: true, time: new Date().toISOString() });
  }),
  http.post("/api/echo", async ({ request }) => {
    const d = readDelay(request);
    const er = readErrorRate(request);
    if (d) await delay(d);
    if (maybeFail(er))
      return HttpResponse.json(
        { error: "Injected error (echo)" },
        { status: 503 },
      );
    const body = await request.json().catch(() => null);
    return HttpResponse.json({ received: body });
  }),
];
