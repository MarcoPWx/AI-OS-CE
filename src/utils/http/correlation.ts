export function generateCorrelationId(): string {
  // Opaque, privacy-safe, stable per flow when held by caller
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    try {
      // Prefer UUID when available
      return (crypto as any).randomUUID();
    } catch {}
  }
  return "cid-" + Math.random().toString(36).slice(2, 10);
}

export function withCorrelationId(
  headers: Record<string, string> = {},
  correlationId?: string,
): Record<string, string> {
  const cid = correlationId && correlationId.trim() ? correlationId : generateCorrelationId();
  return { ...headers, "X-Correlation-Id": cid };
}

