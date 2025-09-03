import { describe, it, expect } from "vitest";
import { generateCorrelationId, withCorrelationId } from "../../src/utils/http/correlation";

describe("correlation helper (CE)", () => {
  it("generates an opaque correlation id", () => {
    const cid = generateCorrelationId();
    expect(typeof cid).toBe("string");
    expect(cid.length).toBeGreaterThan(8);
  });

  it("attaches X-Correlation-Id when missing", () => {
    const h = withCorrelationId({ "Content-Type": "application/json" });
    expect(h["X-Correlation-Id"]).toBeTruthy();
    expect(h["Content-Type"]).toBe("application/json");
  });

  it("preserves provided correlation id", () => {
    const h = withCorrelationId({}, "cid-test-123");
    expect(h["X-Correlation-Id"]).toBe("cid-test-123");
  });
});

