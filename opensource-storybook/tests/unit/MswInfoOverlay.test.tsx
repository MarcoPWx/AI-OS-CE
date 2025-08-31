/* @vitest-environment jsdom */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MswInfoOverlay } from "../../.storybook/components/MswInfoOverlay";
import { MOCK_ROUTES } from "../../src/mocks/handlers";

describe("MswInfoOverlay", () => {
  it("renders nothing when not visible", () => {
    const { container } = render(
      <MswInfoOverlay visible={false} onClose={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders routes table when visible", () => {
    const onClose = vi.fn();
    const { container } = render(
      <MswInfoOverlay visible={true} onClose={onClose} />,
    );

    expect(screen.getByText("MSW Info")).toBeInTheDocument();
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(MOCK_ROUTES.length);
  });
});
