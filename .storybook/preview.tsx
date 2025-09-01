import React, { useEffect, useMemo, useState } from "react";
import type { Preview } from "@storybook/react";
import "../docs/styles/print.css";
import { HelpPanel } from "./components/HelpPanel";
import { StatusPills } from "./components/StatusPills";
import { initialize, mswDecorator } from "msw-storybook-addon";
import { handlers } from "../src/mocks/handlers";
import { PresenterOverlay } from "./components/PresenterOverlay";
import { MswInfoOverlay } from "./components/MswInfoOverlay";

initialize({ onUnhandledRequest: "bypass" });

function ensurePatchedFetch() {
  if (typeof window === "undefined") return;
  const w: any = window;
  if (w.__ossFetchPatched) return;
  const orig = window.fetch.bind(window);
  w.__ossFetchPatched = true;
  window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers((init as any).headers || {});
    if (w.__mswLatencyMs && String(w.__mswLatencyMs) !== "0")
      headers.set("x-mock-delay", String(w.__mswLatencyMs));
    if (w.__mswErrorRate && String(w.__mswErrorRate) !== "0")
      headers.set("x-mock-error-rate", String(w.__mswErrorRate));
    if (w.__mswDisabled) headers.set("x-mock-disable", "1");
    return orig(input, { ...init, headers });
  };
}

export const globalTypes = {
  mswLatencyMs: {
    name: "MSW Latency",
    description: "Global mock latency (ms)",
    defaultValue: "0",
    toolbar: { icon: "clock", items: ["0", "250", "1000", "2000"] },
  },
  mswErrorRate: {
    name: "MSW Error Rate",
    description: "Global mock error probability (0..1)",
    defaultValue: "0",
    toolbar: { icon: "alert", items: ["0", "0.1", "0.2", "0.5"] },
  },
  mswStatus: {
    name: "MSW",
    description: "Mock Service Worker status",
    defaultValue: "on",
    toolbar: {
      icon: "plug",
      items: [
        { value: "on", title: "On" },
        { value: "off", title: "Off" },
        { value: "info", title: "Info" },
      ],
    },
  },
  docsQuickLink: {
    name: "Docs",
    description: "Quick link to common docs",
    defaultValue: "none",
    toolbar: {
      icon: "book",
      items: [{ value: "none", title: "None" }],
    },
  },
};

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: ["Docs", "Components", "API", "Dev", "*"],
      },
    },
    msw: { handlers },
    controls: { expanded: true },
  },
  decorators: [
    mswDecorator,
    (Story: any, context: any) => {
      const Shell: React.FC = () => {
        const [overlay, setOverlay] = useState<boolean>(false);
        const mswLatency = context?.globals?.mswLatencyMs || "0";
        const mswError = context?.globals?.mswErrorRate || "0";
        const mswStatus = context?.globals?.mswStatus || "on";
        const [mswInfo, setMswInfo] = useState<boolean>(false);

        useEffect(() => {
          if (typeof window !== "undefined") {
            (window as any).__mswLatencyMs = mswLatency;
            (window as any).__mswErrorRate = mswError;
            (window as any).__mswDisabled = mswStatus === "off";
            ensurePatchedFetch();
          }
          setMswInfo(mswStatus === "info");
        }, [mswLatency, mswError, mswStatus]);

        useEffect(() => {
          let lastG = 0;
          const onKey = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === "g") {
              const now = Date.now();
              if (now - lastG < 400) setOverlay((v) => !v);
              lastG = now;
            }
            if (key === "escape") setOverlay(false);
          };
          window.addEventListener("keydown", onKey);
          return () => window.removeEventListener("keydown", onKey);
        }, []);

        useEffect(() => {
          const onToggle = (e: Event) => {
            const detail = (e as CustomEvent)?.detail || {};
            if (detail.script) (window as any).__presenterScript = String(detail.script);
            if (typeof detail.visible === "boolean") setOverlay(!!detail.visible);
            else setOverlay((v) => !v);
          };
          window.addEventListener("presenter:toggle", onToggle as EventListener);
          return () => window.removeEventListener("presenter:toggle", onToggle as EventListener);
        }, []);

        const help = (context?.parameters as any)?.help;
        const quickId = context?.globals?.docsQuickLink;
        const quickLink = useMemo(
          () => (quickId && quickId !== "none" ? `?path=/docs/${quickId}` : null),
          [quickId],
        );

        return (
          <div style={{ position: "relative" }}>
            {quickLink ? (
              <a
                href={quickLink}
                style={{
                  position: "fixed",
                  top: 10,
                  left: 10,
                  background: "#111",
                  color: "#fff",
                  padding: "6px 8px",
                  borderRadius: 6,
                  zIndex: 1001,
                  textDecoration: "none",
                  fontSize: 12,
                }}
              >
                Open Doc
              </a>
            ) : null}
            <main role="main">
              <Story />
            </main>
            <StatusPills />
            {help ? <HelpPanel link={help} /> : null}
            <PresenterOverlay
              visible={overlay}
              onClose={() => setOverlay(false)}
              mswStatus={mswStatus}
              script={(window as any).__presenterScript}
            />
            <MswInfoOverlay visible={mswInfo} onClose={() => setMswInfo(false)} />
          </div>
        );
      };
      return <Shell />;
    },
  ],
};

export default preview;
